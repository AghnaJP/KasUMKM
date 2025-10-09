import {Router} from 'express';
import {sb} from '../supabase.js';

const router = Router();

function getSessionId(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  const m = /^Bearer\s+(.+)$/i.exec(h?.trim() ?? '');
  return m ? m[1] : null;
}

async function getUserFromSession(req) {
  const sid = getSessionId(req);
  if (!sid) return {error: 'missing_token'};

  const now = new Date().toISOString();
  const {data: session} = await sb
    .from('sessions')
    .select('id, user_id, expires_at')
    .eq('id', sid)
    .gt('expires_at', now)
    .single();
  if (!session) return {error: 'invalid_or_expired_session'};

  const {data: user} = await sb
    .from('users')
    .select('id, name')
    .eq('id', session.user_id)
    .single();
  return {user, session};
}

function genCode6() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    {length: 6},
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

async function generateUniqueCode() {
  for (let i = 0; i < 8; i++) {
    const code = genCode6();
    const {data} = await sb
      .from('invite_codes')
      .select('code', {head: true, count: 'exact'})
      .eq('code', code);
    if (!data || data.length === 0) return code;
  }
  return genCode6();
}

async function resolveOwnerCompanyId(user_id) {
  const {data: memberships = []} = await sb
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user_id);
  const owner = memberships.find(m => m.role === 'OWNER');
  if (!owner) throw new Error('owner_membership_not_found');
  return owner.company_id;
}

// POST /invite/create
router.post('/invite/create', async (req, res) => {
  try {
    const {user, error} = await getUserFromSession(req);
    if (error) return res.status(401).json({error});

    const ttl = Number(req.body?.ttl_hours ?? 24);
    const expires_at = new Date(Date.now() + ttl * 3600 * 1000).toISOString();
    const company_id = await resolveOwnerCompanyId(user.id);
    const code = await generateUniqueCode();

    const {data, error: eIns} = await sb
      .from('invite_codes')
      .insert({code, company_id, role: 'CASHIER', expires_at})
      .select()
      .single();
    if (eIns) return res.status(500).json({error: 'create_invite_failed'});

    res.json({
      ok: true,
      code: data.code,
      expires_at: data.expires_at,
      company_id,
      role: data.role,
    });
  } catch (e) {
    console.error('[invite/create]', e);
    res.status(500).json({error: 'invite_create_failed'});
  }
});

// GET /invite/verify/:code
router.get('/invite/verify/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '')
      .trim()
      .toUpperCase();
    const now = new Date().toISOString();
    const {data: invite} = await sb
      .from('invite_codes')
      .select('*')
      .eq('code', code)
      .gt('expires_at', now)
      .single();
    if (!invite) return res.json({ok: true, valid: false});
    res.json({
      ok: true,
      valid: true,
      company_id: invite.company_id,
      role: invite.role,
    });
  } catch (e) {
    res.status(500).json({error: 'invite_verify_failed'});
  }
});

export default router;
