import pool from './db.js';

export async function auth(req, res, next) {
  console.log('🔍 ===== AUTH MIDDLEWARE CALLED =====');

  try {
    const hdr = req.headers.authorization || '';
    console.log(
      '🔍 Auth header:',
      hdr ? `Bearer ${hdr.substring(7, 15)}...` : 'Missing',
    );

    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({error: 'missing_token'});
    }

    console.log('🔍 Token extracted:', token.substring(0, 8) + '...');

    const [rows] = await pool.query(
      'SELECT user_id, expires_at FROM sessions WHERE id=?',
      [token],
    );

    console.log('🔍 Session query result:', rows.length, 'rows found');

    if (!rows.length) {
      console.log('❌ No session found for token');
      return res.status(401).json({error: 'invalid_token'});
    }

    if (new Date(rows[0].expires_at) < new Date()) {
      console.log('❌ Token expired');
      return res.status(401).json({error: 'expired_token'});
    }

    req.userId = rows[0].user_id;
    console.log('✅ req.userId set to:', req.userId);

    const [ms] = await pool.query(
      'SELECT company_id, role FROM memberships WHERE user_id=?',
      [req.userId],
    );
    req.memberships = ms; // [{company_id, role}]
    console.log('✅ req.memberships set:', ms.length, 'memberships');

    console.log('🔍 Calling next()...');
    next();
  } catch (e) {
    console.error('❌ Auth middleware error:', e);
    res.status(500).json({error: 'auth_error'});
  }
}

export function requireRole(req, companyId, allowed) {
  const m = req.memberships.find(x => x.company_id === companyId);
  if (!m) {
    return {ok: false, reason: 'no_membership'};
  }
  if (!allowed.includes(m.role)) {
    return {ok: false, reason: 'forbidden'};
  }
  return {ok: true, role: m.role};
}
