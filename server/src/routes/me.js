import {Router} from 'express';
import {auth} from '../auth.js';
import pool from '../db.js';

const router = Router();

// GET /me  -> info user + membership utama (OWNER diprioritaskan)
router.get('/me', auth, async (req, res) => {
  try {
    const [u] = await pool.query(
      'SELECT id, phone, created_at FROM users WHERE id=?',
      [req.userId],
    );
    const [m] = await pool.query(
      `SELECT company_id, role
       FROM memberships
       WHERE user_id=?
       ORDER BY (role='OWNER') DESC
       LIMIT 1`,
      [req.userId],
    );
    res.json({
      user_id: req.userId,
      phone: u?.[0]?.phone ?? null,
      company_id: m?.[0]?.company_id ?? null,
      role: m?.[0]?.role ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'me_failed'});
  }
});

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
    // Update user name in database
    console.log('📝 Updating user name in database...');
    const [result] = await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [trimmedName, userId],
    );

    console.log('📝 Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'user_not_found'});
    }

    // Get updated user info
    const [userRows] = await pool.query(
      'SELECT id, name, phone FROM users WHERE id = ?',
      [userId],
    );

    if (!userRows.length) {
      return res.status(404).json({error: 'user_not_found'});
    }

    const user = userRows[0];
    console.log('✅ User name updated successfully:', user);

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
    console.error('❌ Update user name error:', error);
    res.status(500).json({
      error: 'update_failed',
      message: error.message,
    });
  }
});

export default router;
