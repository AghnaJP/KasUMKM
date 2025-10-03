import {Router} from 'express';
import bcrypt from 'bcrypt';
import {v4 as uuidv4} from 'uuid';
import pool from '../db.js';

const router = Router();

// POST /login { phone, password }
router.post('/login', async (req, res) => {
  const {phone, password} = req.body;
  if (!phone || !password) {
    return res.status(400).json({error: 'missing_phone_or_password'});
  }

  try {
    const [userRows] = await pool.query(
      'SELECT id, name, phone, password_hash FROM users WHERE phone = ?',
      [phone],
    );

    if (!userRows.length) {
      console.log('❌ User not found:', phone);
      return res.status(404).json({
        error: 'user_not_found',
        message: 'Nomor handphone tidak terdaftar',
      });
    }

    const user = userRows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({error: 'invalid_credentials'});
    }

    const token = uuidv4();
    const days = Number(process.env.SESSION_TTL_DAYS || 7);
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO sessions(id, user_id, expires_at) VALUES (?,?,?)',
      [token, user.id, expires],
    );

    const [m] = await pool.query(
      `SELECT company_id, role
       FROM memberships WHERE user_id=? ORDER BY (role='OWNER') DESC LIMIT 1`,
      [user.id],
    );

    res.json({
      session_token: token,
      user_id: user.id,
      name: user.name,
      company_id: m[0]?.company_id ?? null,
      role: m[0]?.role ?? null,
      expires_at: expires.toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'login_failed'});
  }
});

export default router;
