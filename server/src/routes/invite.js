import {Router} from 'express';
import pool from '../db.js';
import {auth, requireRole} from '../auth.js';

const router = Router();

// POST /companies/:companyId/invites { expires_in_days?: number }
router.post('/companies/:companyId/invites', auth, async (req, res) => {
  const companyId = req.params.companyId;
  const perm = requireRole(req, companyId, ['OWNER']);
  if (!perm.ok) return res.status(403).json({error: perm.reason});

  const days = Number(req.body?.expires_in_days || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  try {
    await pool.query(
      'INSERT INTO invite_codes(code, company_id, role, expires_at) VALUES (?,?,?,?)',
      [code, companyId, 'CASHIER', expiresAt],
    );
    res.json({code, expires_at: expiresAt.toISOString()});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'invite_failed'});
  }
});

export default router;
