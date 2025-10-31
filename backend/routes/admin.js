import express from 'express';
import { dbRun, dbGet, dbAll } from '../database/initDatabase.js';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken);
router.use(requireRole(ROLES.ADMIN));

// GET /api/admin/stats - Get system statistics
router.get('/stats', async (req, res, next) => {
  try {
    const orderCount = await dbGet('SELECT COUNT(*) as count FROM orders');
    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    const feedbackCount = await dbGet('SELECT COUNT(*) as count FROM feedback');
    const totalRevenue = await dbGet('SELECT SUM(subtotal) as total FROM orders WHERE status = ?', ['delivered']);

    res.json({
      orders: {
        total: orderCount.count,
        delivered: (await dbGet('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['delivered'])).count,
        pending: (await dbGet('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['pending'])).count,
        preparing: (await dbGet('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['preparing'])).count,
        out_for_delivery: (await dbGet('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['out-for-delivery'])).count
      },
      users: {
        total: userCount.count,
        customers: (await dbGet('SELECT COUNT(*) as count FROM users WHERE role = ?', ['customer'])).count,
        drivers: (await dbGet('SELECT COUNT(*) as count FROM users WHERE role = ?', ['driver'])).count,
        staff: (await dbGet('SELECT COUNT(*) as count FROM users WHERE role = ?', ['restaurant_staff'])).count,
        admins: (await dbGet('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin'])).count
      },
      feedback: {
        total: feedbackCount.count,
        average_rating: (await dbGet('SELECT AVG(rating) as avg FROM feedback')).avg || 0
      },
      revenue: {
        total: totalRevenue.total || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await dbAll(
      'SELECT id, username, role, restaurant_location_id, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/feedback - Get all feedback
router.get('/feedback', async (req, res, next) => {
  try {
    const feedback = await dbAll('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 100');
    res.json(feedback);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/locations - Get all locations with stats
router.get('/locations', async (req, res, next) => {
  try {
    const locations = await dbAll('SELECT * FROM locations');
    
    // Add stats for each location
    const locationsWithStats = await Promise.all(locations.map(async (location) => {
      const menuCount = await dbGet('SELECT COUNT(*) as count FROM menu_items WHERE location_id = ?', [location.id]);
      return {
        ...location,
        menu_items_count: menuCount.count
      };
    }));

    res.json(locationsWithStats);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users - Create new user
router.post('/users', async (req, res, next) => {
  try {
    const { username, password_hash, role, restaurant_location_id } = req.body;

    if (!username || !password_hash || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await dbRun(
      'INSERT INTO users (username, password_hash, role, restaurant_location_id) VALUES (?, ?, ?, ?)',
      [username, password_hash, role, restaurant_location_id || null]
    );

    const newUser = await dbGet(
      'SELECT id, username, role, restaurant_location_id, created_at FROM users WHERE username = ?',
      [username]
    );

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

export default router;

