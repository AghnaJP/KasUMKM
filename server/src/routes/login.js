import {Router} from 'express';
import bcrypt from 'bcrypt';
import {sb} from '../supabase.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const {phone, password} = req.body || {};
    if (!phone || !password)
      return res.status(400).json({error: 'missing_fields'});

    const {data: user, error} = await sb
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    if (error || !user)
      return res.status(401).json({error: 'invalid_credentials'});

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({error: 'invalid_credentials'});

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const {data: session, error: eSess} = await sb
      .from('sessions')
      .insert({user_id: user.id, expires_at: expiresAt})
      .select()
      .single();
    if (eSess) return res.status(500).json({error: 'create_session_failed'});

    const {data: memberships = []} = await sb
      .from('memberships')
      .select('company_id, role, created_at')
      .eq('user_id', user.id);

    let default_company_id = null;
    let default_role = null;
    if (memberships.length) {
      const owner = memberships.find(m => m.role === 'OWNER');
      const pick = owner || memberships[0];
      default_company_id = pick.company_id;
      default_role = pick.role;
    }

    res.json({
      ok: true,
      token: session.id,
      expires_at: session.expires_at,
      user: {id: user.id, name: user.name, phone: user.phone},
      memberships,
      default_company_id,
      default_role,
    });
  } catch (e) {
    console.error('[login]', e);
    res.status(500).json({error: 'login_failed'});
  }
});

export default router;
