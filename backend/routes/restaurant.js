import express from 'express';
import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
import { Location } from '../models/Location.js';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = express.Router();

// GET /api/restaurant/menu - Get menu for restaurant staff's location
router.get('/menu', verifyToken, requireRole(ROLES.RESTAURANT_STAFF, ROLES.ADMIN), async (req, res, next) => {
  try {
    let locationId = req.user.restaurant_location_id;

    // Admin can specify location
    if (req.user.role === ROLES.ADMIN && req.query.locationId) {
      locationId = req.query.locationId;
    }

    if (!locationId) {
      return res.status(400).json({ error: 'Location not specified' });
    }

    const menu = await MenuItem.find({ location_id: locationId })
      .sort({ name: 1 })
      .lean();

    const formattedMenu = menu.map(item => ({
      id: item.id,
      location_id: item.location_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      is_available: item.is_available !== undefined ? item.is_available : true,
      image_url: item.image_url || ''
    }));

    res.json(formattedMenu);
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurant/menu - Add menu item
router.post('/menu', verifyToken, requireRole(ROLES.RESTAURANT_STAFF, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { id, name, description, price, category, is_available, image_url } = req.body;

    let locationId = req.user.restaurant_location_id;

    // Admin must specify location
    if (req.user.role === ROLES.ADMIN) {
      locationId = req.body.location_id;
    }

    if (!locationId || !id || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const menuItem = new MenuItem({
      id,
      location_id: locationId,
      name,
      description: description || '',
      price,
      category: category || 'main',
      is_available: is_available !== undefined ? is_available : true,
      image_url: image_url || ''
    });

    await menuItem.save();

    res.status(201).json(menuItem);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Menu item with this ID already exists' });
    }
    next(err);
  }
});

// PUT /api/restaurant/menu/:itemId - Update menu item
router.put('/menu/:itemId', verifyToken, requireRole(ROLES.RESTAURANT_STAFF, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, category, is_available, image_url } = req.body;

    // Verify item belongs to user's location
    if (req.user.role === ROLES.RESTAURANT_STAFF) {
      const item = await MenuItem.findOne({ id: itemId }).lean();
      if (!item || item.location_id !== req.user.restaurant_location_id) {
        return res.status(403).json({ error: 'Not authorized to modify this item' });
      }
    }

    const updated = await MenuItem.findOneAndUpdate(
      { id: itemId },
      {
        name,
        description: description || '',
        price,
        category: category || 'main',
        is_available,
        image_url
      },
      { new: true, lean: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/restaurant/menu/:itemId - Delete menu item
router.delete('/menu/:itemId', verifyToken, requireRole(ROLES.RESTAURANT_STAFF, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Verify item belongs to user's location
    if (req.user.role === ROLES.RESTAURANT_STAFF) {
      const item = await MenuItem.findOne({ id: itemId }).lean();
      if (!item || item.location_id !== req.user.restaurant_location_id) {
        return res.status(403).json({ error: 'Not authorized to delete this item' });
      }
    }

    const deleted = await MenuItem.findOneAndDelete({ id: itemId });

    if (!deleted) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurant/orders - Get orders for restaurant
router.get('/orders', verifyToken, requireRole(ROLES.RESTAURANT_STAFF, ROLES.ADMIN), async (req, res, next) => {
  try {
    let locationId = req.user.restaurant_location_id;

    // Admin can specify location
    if (req.user.role === ROLES.ADMIN && req.query.locationId) {
      locationId = req.query.locationId;
    }

    if (!locationId) {
      return res.status(400).json({ error: 'Location not specified' });
    }

    // Find orders where restaurant_ids contains locationId
    // Fallback to checking items if restaurant_ids is empty (legacy support)
    const orders = await Order.find({
      $or: [
        { restaurant_ids: locationId },
        { restaurant_ids: { $exists: false } }, // Legacy orders
        { restaurant_ids: [] } // Legacy orders
      ]
    })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    // Filter legacy orders manually if needed
    const filteredOrders = orders.filter(order => {
      if (order.restaurant_ids && order.restaurant_ids.includes(locationId)) return true;
      // Legacy check
      if (!order.items || !Array.isArray(order.items)) return false;
      return order.items.some(item => item.location_id === locationId);
    });

    res.json(filteredOrders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/restaurant/orders/:orderId/status - Update order status
router.patch('/orders/:orderId/status', verifyToken, requireRole(ROLES.RESTAURANT_STAFF, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled']; // Added 'ready', 'completed' for restaurant workflow

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify order belongs to this restaurant
    const order = await Order.findOne({ id: orderId }).lean();
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization (simplified: if order contains items from this loc)
    const locationId = req.user.restaurant_location_id;
    const isAuthorized = order.restaurant_ids?.includes(locationId) ||
      order.items.some(item => item.location_id === locationId);

    if (!isAuthorized && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    const updateData = {
      status,
      updated_at: new Date()
    };

    if (status === 'preparing') updateData.prepared_at = new Date();
    // 'ready' and 'completed' might not map directly to global order status if multi-vendor, 
    // but for now assuming single-vendor or dominant status update.

    const updatedOrder = await Order.findOneAndUpdate(
      { id: orderId },
      updateData,
      { new: true, lean: true }
    );

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurant/location - Get location details
router.get('/location', verifyToken, requireRole(ROLES.RESTAURANT_STAFF), async (req, res, next) => {
  try {
    const locationId = req.user.restaurant_location_id;
    if (!locationId) return res.status(400).json({ error: 'No location assigned' });

    const location = await Location.findOne({ id: locationId }).lean();
    if (!location) return res.status(404).json({ error: 'Location not found' });

    res.json(location);
  } catch (err) {
    next(err);
  }
});

// PUT /api/restaurant/location - Update location details
router.put('/location', verifyToken, requireRole(ROLES.RESTAURANT_STAFF), async (req, res, next) => {
  try {
    const locationId = req.user.restaurant_location_id;
    if (!locationId) return res.status(400).json({ error: 'No location assigned' });

    const { description, hours, is_active, image_url } = req.body;

    const updated = await Location.findOneAndUpdate(
      { id: locationId },
      { description, hours, is_active, image_url },
      { new: true, lean: true }
    );

    if (!updated) return res.status(404).json({ error: 'Location not found' });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurant/stats - Get analytics
router.get('/stats', verifyToken, requireRole(ROLES.RESTAURANT_STAFF), async (req, res, next) => {
  try {
    const locationId = req.user.restaurant_location_id;
    if (!locationId) return res.status(400).json({ error: 'No location assigned' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get orders for this location
    const orders = await Order.find({
      $or: [
        { restaurant_ids: locationId },
        { 'items.location_id': locationId }
      ]
    }).lean();

    const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
    const totalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.subtotal, 0);

    res.json({
      total_orders: orders.length,
      today_orders: todayOrders.length,
      total_revenue: totalRevenue,
      today_revenue: todayRevenue
    });
  } catch (err) {
    next(err);
  }
});

export default router;
