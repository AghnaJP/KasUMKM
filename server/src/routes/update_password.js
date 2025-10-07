// routes/update_password.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';

const router = Router();

router.put('/update-password', async (req, res) => {
  const { phone, old_password, new_password } = req.body || {};

  if (!phone || !old_password || !new_password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT password_hash FROM users WHERE phone=?', [phone]);
    if (!rows.length) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    const { password_hash } = rows[0];
    const match = await bcrypt.compare(old_password, password_hash);
    if (!match) {
      return res.status(401).json({ error: 'invalid_old_password' });
    }

    const newHash = await bcrypt.hash(new_password, 10);

    await conn.query('UPDATE users SET password_hash=? WHERE phone=?', [newHash, phone]);

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'update_failed' });
  } finally {
    conn.release();
  }
});

export default router;
