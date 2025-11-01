import express from 'express';
import { dbRun, dbGet, dbAll } from '../database/initDatabase.js';

// Simple UUID generator (for prototype)
function generateOrderId() {
  return Math.random().toString(36).substring(2, 15).toUpperCase();
}

const router = express.Router();


// POST /api/orders - Create a new order
router.post('/', async (req, res, next) => {
  try {
    const { items, subtotal, dropOffLocation, recipientName, tip } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({ error: 'Invalid subtotal' });
    }

    if (!dropOffLocation) {
      return res.status(400).json({ error: 'Drop-off location required' });
    }

    const orderId = generateOrderId();
    const now = new Date().toISOString();
    const tipAmount = tip || 0;

    await dbRun(`
      INSERT INTO orders (id, items, subtotal, drop_off_location, recipient_name, tip, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [orderId, JSON.stringify(items), subtotal, dropOffLocation, recipientName || null, tipAmount, 'pending', now, now]);

    const order = {
      id: orderId,
      items,
      subtotal,
      tip: tipAmount,
      drop: dropOffLocation,
      recipient_name: recipientName || null,
      status: 'pending',
      createdAt: now
    };

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:orderId - Get specific order
router.get('/:orderId', async (req, res, next) => {
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Parse JSON fields
    const parsedOrder = {
      ...order,
      items: JSON.parse(order.items)
    };

    res.json(parsedOrder);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders - Get all orders (for demo purposes)
router.get('/', async (req, res, next) => {
  try {
    const orders = await dbAll('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    
    // Parse JSON fields for all orders
    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json(parsedOrders);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:orderId/status - Update order status
router.patch('/:orderId/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const now = new Date().toISOString();
    
    await dbRun(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      [status, now, req.params.orderId]
    );

    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      ...order,
      items: JSON.parse(order.items)
    });
  } catch (err) {
    next(err);
  }
});

export default router;

