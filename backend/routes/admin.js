import express from 'express';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Feedback } from '../models/Feedback.js';
import { Location } from '../models/Location.js';
import { MenuItem } from '../models/MenuItem.js';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken);
router.use(requireRole(ROLES.ADMIN));

// GET /api/admin/stats - Get system statistics
router.get('/stats', async (req, res, next) => {
  try {
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    
    const deliveredOrders = await Order.find({ status: 'delivered' }).lean();
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);

    const orderStats = {
      total: orderCount,
      delivered: await Order.countDocuments({ status: 'delivered' }),
      pending: await Order.countDocuments({ status: 'pending' }),
      preparing: await Order.countDocuments({ status: 'preparing' }),
      out_for_delivery: await Order.countDocuments({ status: 'out-for-delivery' })
    };

    const userStats = {
      total: userCount,
      customers: await User.countDocuments({ role: 'customer' }),
      drivers: await User.countDocuments({ role: 'driver' }),
      staff: await User.countDocuments({ role: 'restaurant_staff' }),
      admins: await User.countDocuments({ role: 'admin' })
    };

    const feedbackData = await Feedback.find().lean();
    const avgRating = feedbackData.length > 0
      ? feedbackData.reduce((sum, fb) => sum + fb.rating, 0) / feedbackData.length
      : 0;

    res.json({
      orders: orderStats,
      users: userStats,
      feedback: {
        total: feedbackCount,
        average_rating: Number(avgRating.toFixed(2))
      },
      revenue: {
        total: Number(totalRevenue.toFixed(2))
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find()
      .select('_id username role restaurant_location_id created_at')
      .sort({ created_at: -1 })
      .lean();

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      restaurant_location_id: user.restaurant_location_id,
      created_at: user.created_at
    }));

    res.json(formattedUsers);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/feedback - Get all feedback
router.get('/feedback', async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .sort({ created_at: -1 })
      .limit(100)
      .lean();

    const formattedFeedback = feedback.map(fb => ({
      id: fb._id.toString(),
      order_id: fb.order_id,
      rating: fb.rating,
      comment: fb.comment,
      created_at: fb.created_at
    }));

    res.json(formattedFeedback);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/locations - Get all locations with stats
router.get('/locations', async (req, res, next) => {
  try {
    const locations = await Location.find().lean();
    
    // Add stats for each location
    const locationsWithStats = await Promise.all(locations.map(async (location) => {
      const menuCount = await MenuItem.countDocuments({ location_id: location.id });
      return {
        id: location.id,
        name: location.name,
        hours: location.hours,
        address: location.address,
        menu_items_count: menuCount
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

    const user = new User({
      username,
      password_hash,
      role,
      restaurant_location_id: restaurant_location_id || null
    });

    await user.save();

    res.status(201).json({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      restaurant_location_id: user.restaurant_location_id,
      created_at: user.created_at
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    next(err);
  }
});

export default router;
