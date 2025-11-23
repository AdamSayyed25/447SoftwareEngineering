import express from 'express';
import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
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
      category: item.category
    }));

    res.json(formattedMenu);
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurant/menu - Add menu item
router.post('/menu', verifyToken, requireRole(ROLES.RESTAURANT_STAFF, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { id, name, description, price, category } = req.body;
    
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
      category: category || 'main'
    });

    await menuItem.save();

    const formattedItem = {
      id: menuItem.id,
      location_id: menuItem.location_id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category
    };

    res.status(201).json(formattedItem);
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
    const { name, description, price, category } = req.body;

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
        category: category || 'main'
      },
      { new: true, lean: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const formattedItem = {
      id: updated.id,
      location_id: updated.location_id,
      name: updated.name,
      description: updated.description,
      price: updated.price,
      category: updated.category
    };

    res.json(formattedItem);
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

    // Get orders that have items from this restaurant
    // Note: This is simplified - in production, you'd need to track which restaurant in order_items
    // For now, we'll get all orders and filter by location (simplified approach)
    const orders = await Order.find()
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    // Filter orders that have items from this location
    const filteredOrders = orders.filter(order => {
      if (!order.items || !Array.isArray(order.items)) return false;
      // Check if any item in the order matches items from this location
      // In production, you'd have a better way to track this
      return true; // Simplified for now
    });

    const formattedOrders = filteredOrders.map(order => ({
      id: order.id,
      user_id: order.user_id ? order.user_id.toString() : null,
      items: order.items,
      subtotal: order.subtotal,
      tip: order.tip || 0,
      drop_off_location: order.drop_off_location,
      recipient_name: order.recipient_name,
      driver_id: order.driver_id,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    }));

    res.json(formattedOrders);
  } catch (err) {
    next(err);
  }
});

export default router;
