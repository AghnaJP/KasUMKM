import {Router} from 'express';
import bcrypt from 'bcrypt';
import {sb} from '../supabase.js';

const router = Router();

router.post('/register', async (req, res) => {
  const {name, phone, password, invite_code} = req.body || {};
  if (!name || !phone || !password) {
    return res.status(400).json({error: 'missing_fields'});
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    let invite = null;
    if (invite_code && String(invite_code).trim()) {
      const now = new Date().toISOString();
      const {data, error} = await sb
        .from('invite_codes')
        .select('*')
        .eq('code', String(invite_code).trim().toUpperCase())
        .gt('expires_at', now)
        .single();
      if (error)
        return res.status(400).json({error: 'invalid_or_expired_invite'});
      invite = data;
    }

    const {data: user, error: eUser} = await sb
      .from('users')
      .insert({name, phone, password_hash})
      .select()
      .single();
    if (eUser) {
      if (eUser.code === '23505')
        return res.status(409).json({error: 'phone_already_used'});
      throw eUser;
    }

    let company = null;
    let membership = null;

    if (invite) {
      const {data: mem, error: eMem} = await sb
        .from('memberships')
        .insert({
          user_id: user.id,
          company_id: invite.company_id,
          role: invite.role || 'CASHIER',
        })
        .select()
        .single();
      if (eMem) throw eMem;
      membership = mem;
      await sb.from('invite_codes').delete().eq('code', invite.code);
      const {data: comp} = await sb
        .from('companies')
        .select('*')
        .eq('id', invite.company_id)
        .single();
      company = comp || null;
    } else {
      const companyName = `${name}'s Company`;
      const {data: comp, error: eComp} = await sb
        .from('companies')
        .insert({name: companyName})
        .select()
        .single();
      if (eComp) throw eComp;
      company = comp;

      const {data: mem, error: eMem} = await sb
        .from('memberships')
        .insert({user_id: user.id, company_id: company.id, role: 'OWNER'})
        .select()
        .single();
      if (eMem) throw eMem;
      membership = mem;
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const {data: session, error: eSess} = await sb
      .from('sessions')
      .insert({user_id: user.id, expires_at: expiresAt})
      .select()
      .single();
    if (eSess) {
      console.warn('[register] create session failed:', eSess);
    }

    return res.json({
      ok: true,
      token: session?.id ?? null,
      expires_at: session?.expires_at ?? null,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        created_at: user.created_at,
      },
      company,
      membership,
    });
  } catch (e) {
    console.error('[register]', e);
    return res.status(500).json({error: 'register_failed'});
  }
});

export default router;
