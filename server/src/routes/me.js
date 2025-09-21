import {Router} from 'express';
import {auth} from '../auth.js';
import pool from '../db.js';

const router = Router();

// GET /me  -> info user + membership utama (OWNER diprioritaskan)
router.get('/me', auth, async (req, res) => {
  try {
    const [u] = await pool.query(
      'SELECT id, phone, created_at FROM users WHERE id=?',
      [req.userId],
    );
    const [m] = await pool.query(
      `SELECT company_id, role
       FROM memberships
       WHERE user_id=?
       ORDER BY (role='OWNER') DESC
       LIMIT 1`,
      [req.userId],
    );
    res.json({
      user_id: req.userId,
      phone: u?.[0]?.phone ?? null,
      company_id: m?.[0]?.company_id ?? null,
      role: m?.[0]?.role ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'me_failed'});
  }
});

export default router;
