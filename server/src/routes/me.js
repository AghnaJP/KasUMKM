import {Router} from 'express';
import {sb} from '../supabase.js';
import {auth} from '../auth.js';

const router = Router();

function getSessionId(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  const m = /^Bearer\s+(.+)$/i.exec(h?.trim() ?? '');
  return m ? m[1] : null;
}

router.get('/me', async (req, res) => {
  try {
    const sid = getSessionId(req);
    if (!sid) {
      return res.status(401).json({error: 'missing_token'});
    }

    const now = new Date().toISOString();
    const {data: session} = await sb
      .from('sessions')
      .select('id, user_id, expires_at')
      .eq('id', sid)
      .gt('expires_at', now)
      .single();
    if (!session) {
      return res.status(401).json({error: 'invalid_or_expired_session'});
    }

    const {data: user} = await sb
      .from('users')
      .select('id, name, phone, created_at')
      .eq('id', session.user_id)
      .single();
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
      user,
      memberships,
      default_company_id,
      default_role,
      session: {id: session.id, expires_at: session.expires_at},
    });
  } catch (e) {
    console.error('[me]', e);
    res.status(500).json({error: 'me_failed'});
  }
});

export default router;

router.put('/me', auth, async (req, res) => {
  console.log('📝 PUT /me - Update user profile');
  console.log('📝 req.userId:', req.userId);
  console.log('📝 Request body:', req.body);

  const userId = req.userId;
  const {name} = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({error: 'name_required'});
  }

  const trimmedName = name.trim();
  if (trimmedName.length > 255) {
    return res.status(400).json({error: 'name_too_long'});
  }

  try {
    // Update user name in Supabase
    const {error: updateError} = await sb
      .from('users')
      .update({name: trimmedName})
      .eq('id', userId);

    if (updateError) {
      console.error('Update user name error:', updateError);
      return res
        .status(500)
        .json({error: 'update_failed', message: updateError.message});
    }

    // Get updated user info from Supabase
    const {data: user, error: userError} = await sb
      .from('users')
      .select('id, name, phone')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({error: 'user_not_found'});
    }

    console.log('User name updated successfully:', user);

    res.json({
      success: true,
      message: 'User name updated successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Update user name error:', error);
    res.status(500).json({
      error: 'update_failed',
      message: error.message,
    });
  }
});
