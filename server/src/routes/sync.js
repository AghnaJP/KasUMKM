import {Router} from 'express';
import pool from '../db.js';
import {isoToMySQL} from '../utils/dateTime.js';
const router = Router();

/**
 * GET /sync/pull?company_id=...&since=ISO(optional)
 * Respon: { server_time, transactions: [] }
 */
router.get('/pull', async (req, res) => {
  try {
    const company_id = String(req.query.company_id || '');
    const since = req.query.since ? String(req.query.since) : null;
    if (!company_id)
      return res.status(400).json({error: 'company_id_required'});

    const server_time = new Date().toISOString();

    const sql = since
      ? `SELECT id, name, type, amount, occurred_at, updated_at, deleted_at
           FROM transactions
          WHERE company_id = ? AND updated_at > ?
          ORDER BY updated_at ASC`
      : `SELECT id, name, type, amount, occurred_at, updated_at, deleted_at
           FROM transactions
          WHERE company_id = ?
          ORDER BY updated_at ASC`;

    const params = since ? [company_id, since] : [company_id];
    const [rows] = await pool.query(sql, params);

    return res.json({
      server_time,
      transactions: Array.isArray(rows) ? rows : [],
    });
  } catch (e) {
    console.error('pull error', e);
    return res.status(500).json({error: 'server_error'});
  }
});

/**
 * POST /sync/push
 * Body:
 * {
 *   company_id: "...",
 *   changes: {
 *     transactions: [{id,name,type,amount,occurred_at,updated_at,deleted_at}]
 *   }
 * }
 * Upsert ke MySQL by id.
 */
// server/src/routes/sync.js

router.post('/push', async (req, res) => {
  console.log('🔁 Received PUSH:', req.body);
  try {
    const {company_id, changes} = req.body || {};
    if (!company_id)
      return res.status(400).json({error: 'company_id_required'});

    const txs = Array.isArray(changes?.transactions)
      ? changes.transactions
      : [];
    if (!txs.length) return res.json({ok: true, pushed: 0});

    const sql = `
      INSERT INTO transactions
        (id, company_id, name, type, amount, occurred_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name=VALUES(name),
        type=VALUES(type),
        amount=VALUES(amount),
        occurred_at=VALUES(occurred_at),
        updated_at=VALUES(updated_at),
        deleted_at=VALUES(deleted_at)
    `;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const r of txs) {
        try {
          await conn.query(sql, [
            r.id,
            company_id,
            r.name,
            r.type, // 'INCOME' | 'EXPENSE'
            r.amount,
            isoToMySQL(r.occurred_at), // ← convert ISO → 'YYYY-MM-DD HH:MM:SS.mmm'
            isoToMySQL(r.updated_at),
            r.deleted_at ? isoToMySQL(r.deleted_at) : null,
          ]);
        } catch (e) {
          console.error('❌ INSERT ONE FAILED id=', r.id, e?.sqlMessage || e);
          throw e;
        }
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      console.error('❌ TRANSACTION ROLLBACK', e?.sqlMessage || e);
      return res.status(500).json({ok: false, error: 'insert_failed'});
    } finally {
      conn.release();
    }

    return res.json({ok: true, pushed: txs.length});
  } catch (e) {
    console.error('push error', e);
    return res.status(500).json({error: 'server_error'});
  }
});

export default router;
