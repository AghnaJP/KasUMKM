import {Router} from 'express';
import pool from '../db.js';
import {auth} from '../auth.js';

const router = Router();

console.log('✅ Delete route loaded');

router.delete('/users', auth, async (req, res) => {
  console.log('🗑️ ===== DELETE /users ENDPOINT HIT =====');
  console.log('🗑️ req.userId:', req.userId); // ✅ Change from req.user to req.userId

  // ✅ Check req.userId instead of req.user
  if (!req.userId) {
    console.error('❌ req.userId is undefined - auth middleware failed');
    return res.status(401).json({error: 'user_not_authenticated'});
  }

  const userId = req.userId; // ✅ Use req.userId directly
  console.log('🗑️ Processing delete for user:', userId);

  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const [testResult] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection OK:', testResult);

    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const [userCheck] = await pool.query(
      'SELECT id, phone FROM users WHERE id = ?',
      [userId],
    );
    console.log('🔍 User check result:', userCheck);

    if (!userCheck.length) {
      return res.status(404).json({error: 'user_not_found'});
    }

    // Delete user sessions first
    console.log('🗑️ Deleting user sessions...');
    const [sessionResult] = await pool.query(
      'DELETE FROM sessions WHERE user_id = ?',
      [userId],
    );
    console.log('✅ Sessions deleted:', sessionResult.affectedRows);

    // Delete user memberships
    console.log('🗑️ Deleting user memberships...');
    const [memberResult] = await pool.query(
      'DELETE FROM memberships WHERE user_id = ?',
      [userId],
    );
    console.log('✅ Memberships deleted:', memberResult.affectedRows);

    // Delete user
    console.log('🗑️ Deleting user...');
    const [userResult] = await pool.query('DELETE FROM users WHERE id = ?', [
      userId,
    ]);
    console.log('✅ User deleted:', userResult.affectedRows);

    res.json({
      success: true,
      message: 'User deleted successfully',
      deleted: {
        sessions: sessionResult.affectedRows,
        memberships: memberResult.affectedRows,
        users: userResult.affectedRows,
      },
    });
  } catch (error) {
    console.error('❌ Delete operation error:', error);
    res.status(500).json({
      error: 'delete_failed',
      message: error.message,
    });
  }
});

export default router;
