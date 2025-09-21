import pool from './db.js';

export async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({error: 'missing_token'});

    const [rows] = await pool.query(
      'SELECT user_id, expires_at FROM sessions WHERE id=?',
      [token],
    );
    if (!rows.length) return res.status(401).json({error: 'invalid_token'});
    if (new Date(rows[0].expires_at) < new Date())
      return res.status(401).json({error: 'expired_token'});

    req.userId = rows[0].user_id;

    const [ms] = await pool.query(
      'SELECT company_id, role FROM memberships WHERE user_id=?',
      [req.userId],
    );
    req.memberships = ms; // [{company_id, role}]
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'auth_error'});
  }
}

export function requireRole(req, companyId, allowed) {
  const m = req.memberships.find(x => x.company_id === companyId);
  if (!m) return {ok: false, reason: 'no_membership'};
  if (!allowed.includes(m.role)) return {ok: false, reason: 'forbidden'};
  return {ok: true, role: m.role};
}
