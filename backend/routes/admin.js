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
        ...location, // Include all existing fields
        id: location.id, // Ensure id is set (though ...location might have _id, frontend uses id)
        menu_items_count: menuCount,
        // Ensure defaults for older documents if missing
        is_active: location.is_active !== undefined ? location.is_active : true,
        category: location.category || 'Dining'
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

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', async (req, res, next) => {
  try {
    const { role, is_active, restaurant_location_id } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
        is_active,
        restaurant_location_id: restaurant_location_id || null
      },
      { new: true }
    ).select('-password_hash');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      restaurant_location_id: user.restaurant_location_id,
      created_at: user.created_at
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users/:id/reset-password - Reset user password
router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const import_bcrypt = await import('bcryptjs');
    const bcrypt = import_bcrypt.default;

    // Generate a random 8-character password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password_hash: passwordHash },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      message: 'Password reset successfully',
      temp_password: tempPassword
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/locations - Create location
router.post('/locations', async (req, res, next) => {
  try {
    const { id, name, hours, address, image_url, description, category, is_active, contact_email, tags, assigned_staff_id } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'ID and Name are required' });
    }

    const existingLoc = await Location.findOne({ id });
    if (existingLoc) {
      return res.status(400).json({ error: 'Location ID already exists' });
    }

    const location = new Location({
      id, name, hours, address,
      image_url, description, category, is_active, contact_email, tags
    });
    await location.save();

    if (assigned_staff_id) {
      await User.findByIdAndUpdate(assigned_staff_id, { restaurant_location_id: id });
    }

    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/locations/:id - Update location
router.put('/locations/:id', async (req, res, next) => {
  try {
    const { name, hours, address, image_url, description, category, is_active, contact_email, tags, assigned_staff_id } = req.body;

    const location = await Location.findOneAndUpdate(
      { id: req.params.id },
      {
        name, hours, address,
        image_url, description, category, is_active, contact_email, tags
      },
      { new: true }
    );

    if (!location) return res.status(404).json({ error: 'Location not found' });

    if (assigned_staff_id) {
      await User.findByIdAndUpdate(assigned_staff_id, { restaurant_location_id: req.params.id });
    }

    res.json(location);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/locations/:id - Delete location
router.delete('/locations/:id', async (req, res, next) => {
  try {
    const location = await Location.findOneAndDelete({ id: req.params.id });
    if (!location) return res.status(404).json({ error: 'Location not found' });

    // Also delete associated menu items
    await MenuItem.deleteMany({ location_id: req.params.id });

    res.json({ message: 'Location and menu items deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
