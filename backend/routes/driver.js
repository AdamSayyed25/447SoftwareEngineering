import express from 'express';
import { dbRun, dbGet, dbAll } from '../database/initDatabase.js';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = express.Router();

// GET /api/driver/orders - Get available orders for pickup
router.get('/orders', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    // Orders available for pickup (unassigned)
    const orders = await dbAll(
      'SELECT * FROM orders WHERE status IN (?, ?) AND (driver_id IS NULL OR driver_id = "") ORDER BY created_at DESC',
      ['pending', 'preparing']
    );

    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json(parsedOrders);
  } catch (err) {
    next(err);
  }
});

// POST /api/driver/orders/:orderId/accept - Accept an order for delivery
router.post('/orders/:orderId/accept', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const driverId = req.user.username;

    // Get the order
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Assign to driver and set status to out-for-delivery
    const now = new Date().toISOString();
    await dbRun(
      'UPDATE orders SET driver_id = ?, status = ?, updated_at = ? WHERE id = ?',
      [driverId, 'out-for-delivery', now, orderId]
    );

    const updated = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json({
      ...updated,
      items: JSON.parse(updated.items),
      driver: driverId
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/driver/orders/:orderId/decline - Decline an assigned order (unassign and set pending)
router.post('/orders/:orderId/decline', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const driverId = req.user.username;

    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only the assigned driver (or admin) can decline/unassign
    if (req.user.role !== ROLES.ADMIN && order.driver_id !== driverId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const now = new Date().toISOString();
    await dbRun('UPDATE orders SET driver_id = NULL, status = ?, updated_at = ? WHERE id = ?', ['pending', now, orderId]);
    const updated = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json({ ...updated, items: JSON.parse(updated.items) });
  } catch (err) {
    next(err);
  }
});

// POST /api/driver/orders/:orderId/deliver - Mark order as delivered
router.post('/orders/:orderId/deliver', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Get the order
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status to delivered
    const now = new Date().toISOString();
    await dbRun(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      ['delivered', now, orderId]
    );

    const updated = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json({
      ...updated,
      items: JSON.parse(updated.items)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/driver/my-deliveries - Get driver's delivery history
router.get('/my-deliveries', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const driverId = req.user.username;
    const current = await dbAll('SELECT * FROM orders WHERE driver_id = ? AND status != ? ORDER BY updated_at DESC', [driverId, 'delivered']);
    const completed = await dbAll('SELECT * FROM orders WHERE driver_id = ? AND status = ? ORDER BY updated_at DESC', [driverId, 'delivered']);

    const mapParse = (arr) => arr.map(o => ({ ...o, items: JSON.parse(o.items) }));

    res.json({ current: mapParse(current), completed: mapParse(completed) });
  } catch (err) {
    next(err);
  }
});

// GET /api/driver/stats - Driver earnings and analytics
router.get('/stats', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const driverId = req.user.username;
    const delivered = await dbAll('SELECT * FROM orders WHERE driver_id = ? AND status = ? ORDER BY updated_at DESC', [driverId, 'delivered']);
    const parse = delivered.map(o => ({ ...o, items: JSON.parse(o.items) }));

    // Earnings model: base $5 + 10% of subtotal per delivery (demo)
    const earningFor = (o) => 5 + 0.10 * Number(o.subtotal || 0);
    const totalEarnings = parse.reduce((s, o) => s + earningFor(o), 0);
    const deliveriesCompleted = parse.length;

    // Avg delivery time (minutes): updated_at - created_at
    const avgDeliveryTimeMin = parse.length > 0 ? (
      parse.reduce((s, o) => s + ((new Date(o.updated_at) - new Date(o.created_at)) / 60000), 0) / parse.length
    ) : 0;

    // Weekly earnings breakdown (last 7 days by date)
    const byDay = {};
    for (const o of parse) {
      const day = new Date(o.updated_at || o.created_at).toISOString().slice(0,10);
      byDay[day] = (byDay[day] || 0) + earningFor(o);
    }

    const recent = parse.slice(0, 5).map(o => ({ id: o.id, total: o.subtotal, drop: o.drop_off_location, date: o.updated_at || o.created_at }));

    res.json({
      totalEarnings: Number(totalEarnings.toFixed(2)),
      deliveriesCompleted,
      avgDeliveryTimeMin: Number(avgDeliveryTimeMin.toFixed(1)),
      weekly: byDay,
      recent
    });
  } catch (err) {
    next(err);
  }
});

export default router;

