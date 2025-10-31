import express from 'express';
import { dbRun, dbGet, dbAll } from '../database/initDatabase.js';
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

    const menu = await dbAll(
      'SELECT * FROM menu_items WHERE location_id = ? ORDER BY name',
      [locationId]
    );

    res.json(menu);
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

    await dbRun(
      'INSERT INTO menu_items (id, location_id, name, description, price, category) VALUES (?, ?, ?, ?, ?, ?)',
      [id, locationId, name, description || '', price, category || 'main']
    );

    const newItem = await dbGet('SELECT * FROM menu_items WHERE id = ?', [id]);
    res.status(201).json(newItem);
  } catch (err) {
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
      const item = await dbGet('SELECT * FROM menu_items WHERE id = ?', [itemId]);
      if (!item || item.location_id !== req.user.restaurant_location_id) {
        return res.status(403).json({ error: 'Not authorized to modify this item' });
      }
    }

    await dbRun(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
      [name, description || '', price, category || 'main', itemId]
    );

    const updated = await dbGet('SELECT * FROM menu_items WHERE id = ?', [itemId]);
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
      const item = await dbGet('SELECT * FROM menu_items WHERE id = ?', [itemId]);
      if (!item || item.location_id !== req.user.restaurant_location_id) {
        return res.status(403).json({ error: 'Not authorized to delete this item' });
      }
    }

    await dbRun('DELETE FROM menu_items WHERE id = ?', [itemId]);
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
    const orders = await dbAll(`
      SELECT o.* FROM orders o
      WHERE EXISTS (
        SELECT 1 FROM menu_items m
        WHERE m.location_id = ?
      )
      ORDER BY o.created_at DESC
      LIMIT 50
    `, [locationId]);

    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json(parsedOrders);
  } catch (err) {
    next(err);
  }
});

export default router;

