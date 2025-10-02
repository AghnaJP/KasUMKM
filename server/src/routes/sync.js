import {Router} from 'express';
import pool from '../db.js';
import {isoToMySQL} from '../utils/dateTime.js';
const router = Router();

/**
 * GET /sync/pull?company_id=...&since=ISO(optional)
 * Respon: { server_time, transactions: [], menus: [] }
 */
router.get('/pull', async (req, res) => {
  try {
    const company_id = String(req.query.company_id || '');
    const since = req.query.since ? String(req.query.since) : null;
    if (!company_id)
      return res.status(400).json({error: 'company_id_required'});

    const server_time = new Date().toISOString();

    const txSql = since
      ? `SELECT id, name, type, amount, quantity, unit_price, menu_id,
                occurred_at, updated_at, deleted_at
           FROM transactions
          WHERE company_id = ? AND updated_at > ?
          ORDER BY updated_at ASC`
      : `SELECT id, name, type, amount, quantity, unit_price, menu_id,
                occurred_at, updated_at, deleted_at
           FROM transactions
          WHERE company_id = ?
          ORDER BY updated_at ASC`;

    const txParams = since ? [company_id, since] : [company_id];
    const [txRows] = await pool.query(txSql, txParams);

    const menuSql = since
      ? `SELECT id, name, price, category, occurred_at, updated_at, deleted_at
           FROM menus
          WHERE company_id = ? AND updated_at > ?
          ORDER BY updated_at ASC`
      : `SELECT id, name, price, category, occurred_at, updated_at, deleted_at
           FROM menus
          WHERE company_id = ?
          ORDER BY updated_at ASC`;

    const menuParams = since ? [company_id, since] : [company_id];
    const [menuRows] = await pool.query(menuSql, menuParams);

    return res.json({
      server_time,
      transactions: Array.isArray(txRows) ? txRows : [],
      menus: Array.isArray(menuRows) ? menuRows : [],
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
 *     transactions: [{id,name,type,amount,occurred_at,updated_at,deleted_at}],
 *     menus: [{id,name,price,category,occurred_at,updated_at,deleted_at}]
 *   }
 * }
 * Upsert ke MySQL by id.
 */
router.post('/push', async (req, res) => {
  console.log('🔁 Received PUSH:', req.body);
  try {
    const {company_id, changes} = req.body || {};
    if (!company_id)
      return res.status(400).json({error: 'company_id_required'});

    const txs = Array.isArray(changes?.transactions)
      ? changes.transactions
      : [];
    const menus = Array.isArray(changes?.menus) ? changes.menus : [];
    if (!txs.length && !menus.length) return res.json({ok: true, pushed: 0});

    const txSql = `
      INSERT INTO transactions
        (id, company_id, name, type, amount, quantity, unit_price, menu_id,
         occurred_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name=VALUES(name),
        type=VALUES(type),
        amount=VALUES(amount),
        quantity=VALUES(quantity),
        unit_price=VALUES(unit_price),
        menu_id=VALUES(menu_id),
        occurred_at=VALUES(occurred_at),
        updated_at=VALUES(updated_at),
        deleted_at=VALUES(deleted_at)
    `;

    const menuSql = `
      INSERT INTO menus
        (id, company_id, name, price, category, occurred_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name=VALUES(name),
        price=VALUES(price),
        category=VALUES(category),
        occurred_at=VALUES(occurred_at),
        updated_at=VALUES(updated_at),
        deleted_at=VALUES(deleted_at)
    `;

    const conn = await pool.getConnection();
    let txCount = 0;
    let menuCount = 0;

    try {
      await conn.beginTransaction();

      // === transactions ===
      for (const r of txs) {
        const qty = Number(r.quantity ?? 1);
        const unit =
          r.unit_price != null
            ? Number(r.unit_price)
            : qty
            ? Number(r.amount) / qty
            : Number(r.amount);
        const menuId = r.menu_id ?? null;

        await conn.query(txSql, [
          r.id,
          company_id,
          r.name,
          r.type,
          r.amount,
          qty,
          unit,
          menuId,
          isoToMySQL(r.occurred_at),
          isoToMySQL(r.updated_at),
          r.deleted_at ? isoToMySQL(r.deleted_at) : null,
        ]);
        txCount++;
      }

      for (const m of menus) {
        await conn.query(menuSql, [
          m.id,
          company_id,
          m.name,
          m.price,
          m.category,
          isoToMySQL(m.occurred_at),
          isoToMySQL(m.updated_at),
          m.deleted_at ? isoToMySQL(m.deleted_at) : null,
        ]);
        menuCount++;
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      console.error('❌ TRANSACTION ROLLBACK', e?.sqlMessage || e);
      return res.status(500).json({ok: false, error: 'insert_failed'});
    } finally {
      conn.release();
    }

    return res.json({
      ok: true,
      pushed: {
        transactions: txCount,
        menus: menuCount,
        total: txCount + menuCount,
      },
    });
  } catch (e) {
    console.error('push error', e);
    return res.status(500).json({error: 'server_error'});
  }
});

export default router;
