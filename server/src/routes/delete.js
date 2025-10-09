import {Router} from 'express';
import {sb} from '../supabase.js';
import {auth} from '../auth.js';

const router = Router();

console.log('✅ Delete route loaded (Supabase)');

router.delete('/users', auth, async (req, res) => {
  console.log('🗑️ ===== DELETE /users ENDPOINT HIT =====');
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({error: 'user_not_authenticated'});
  }

  try {
    const {data: user, error: eUser} = await sb
      .from('users')
      .select('id, phone')
      .eq('id', userId)
      .single();

    if (eUser || !user) {
      return res.status(404).json({error: 'user_not_found'});
    }

    const {count: sessionsDeleted, error: eSessDel} = await sb
      .from('sessions')
      .delete()
      .eq('user_id', userId)
      .select('id', {count: 'exact'});
    if (eSessDel) {
      console.error('❌ delete sessions error:', eSessDel);
      return res.status(500).json({error: 'delete_failed'});
    }

    const {count: membershipsDeleted, error: eMemDel} = await sb
      .from('memberships')
      .delete()
      .eq('user_id', userId)
      .select('id', {count: 'exact'});
    if (eMemDel) {
      console.error('❌ delete memberships error:', eMemDel);
      return res.status(500).json({error: 'delete_failed'});
    }

    const {count: usersDeleted, error: eUserDel} = await sb
      .from('users')
      .delete()
      .eq('id', userId)
      .select('id', {count: 'exact'});
    if (eUserDel) {
      console.error('❌ delete user error:', eUserDel);
      return res.status(500).json({error: 'delete_failed'});
    }

    return res.json({
      success: true,
      message: 'User deleted successfully',
      deleted: {
        sessions: sessionsDeleted ?? 0,
        memberships: membershipsDeleted ?? 0,
        users: usersDeleted ?? 0,
      },
    });
  } catch (err) {
    console.error('❌ Delete operation error:', err);
    return res
      .status(500)
      .json({error: 'delete_failed', message: err?.message});
  }
});

export default router;
