import {Router} from 'express';
import bcrypt from 'bcrypt';
import {v4 as uuidv4} from 'uuid';
import pool from '../db.js';

const router = Router();

// POST /register { name, phone, password, invite_code? }
router.post('/register', async (req, res) => {
  const {name, phone, password, invite_code} = req.body || {};
  if (!name || !phone || !password)
    {return res.status(400).json({error: 'missing_fields'});}

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [dup] = await conn.query('SELECT id FROM users WHERE phone=?', [
      phone,
    ]);
    if (dup.length) {
      await conn.rollback();
      return res.status(409).json({error: 'phone_exists'});
    }

    const userId = uuidv4();
    const passHash = await bcrypt.hash(password, 10);
    await conn.query(
      'INSERT INTO users(id, phone, password_hash) VALUES (?,?,?)',
      [userId, phone, passHash],
    );

    let companyId, role;

    if (invite_code) {
      const [codes] = await conn.query(
        'SELECT company_id, expires_at FROM invite_codes WHERE code=?',
        [invite_code.trim()],
      );
      if (!codes.length) {
        await conn.rollback();
        return res.status(400).json({error: 'invalid_invite'});
      }
      if (new Date(codes[0].expires_at) < new Date()) {
        await conn.rollback();
        return res.status(400).json({error: 'expired_invite'});
      }

      companyId = codes[0].company_id;
      role = 'CASHIER';
      await conn.query(
        'INSERT INTO memberships(id, user_id, company_id, role) VALUES (UUID(),?,?,?)',
        [userId, companyId, role],
      );
      await conn.query('DELETE FROM invite_codes WHERE code=?', [
        invite_code.trim(),
      ]);
    } else {
      companyId = uuidv4();
      role = 'OWNER';
      await conn.query('INSERT INTO companies(id, name) VALUES (?,?)', [
        companyId,
        `${name}'s Company`,
      ]);
      await conn.query(
        'INSERT INTO memberships(id, user_id, company_id, role) VALUES (UUID(),?,?,?)',
        [userId, companyId, role],
      );
    }

    const token = uuidv4();
    const days = Number(process.env.SESSION_TTL_DAYS || 7);
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await conn.query(
      'INSERT INTO sessions(id, user_id, expires_at) VALUES (?,?,?)',
      [token, userId, expires],
    );

    await conn.commit();
    res.json({
      session_token: token,
      user_id: userId,
      company_id: companyId,
      role,
      expires_at: expires.toISOString(),
    });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({error: 'register_failed'});
  } finally {
    conn.release();
  }
});

export default router;
