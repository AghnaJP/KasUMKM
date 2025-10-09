import {Router} from 'express';
import bcrypt from 'bcrypt';
import {sb} from '../supabase.js';

const router = Router();

router.put('/update-password', async (req, res) => 
{
  try
  {
    const {phone, old_password, new_password} = req.body || {};
    if (!phone || !old_password || !new_password) 
    {
      return res.status(400).json({error: 'missing_fields'});
    }

    const {data: user, error: eUser} = await sb
      .from('users')
      .select('id, password_hash')
      .eq('phone', String(phone).trim())
      .single();

    if (eUser || !user) 
    {
      return res.status(401).json({error: 'invalid_old_password'});
    }

    const ok = await bcrypt.compare(String(old_password), user.password_hash);
    if (!ok) 
    {
      return res.status(401).json({error: 'invalid_old_password'});
    }

    const newHash = await bcrypt.hash(String(new_password), 10);
    const {error: eUpd} = await sb
      .from('users')
      .update({password_hash: newHash})
      .eq('id', user.id);

    if (eUpd) 
    {
      console.error('[update-password] update failed:', eUpd);
      return res.status(500).json({error: 'update_failed'});
    }
    return res.json({ok: true});
  } catch (e) {
    console.error('[update-password]', e);
    return res.status(500).json({error: 'update_failed'});
  }
});

export default router;
