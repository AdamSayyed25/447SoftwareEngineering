import express from 'express';
import { Order } from '../models/Order.js';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = express.Router();

// GET /api/driver/orders - Get available orders for pickup
router.get('/orders', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    // Orders available for pickup (unassigned, status pending or preparing)
    const orders = await Order.find({
      status: { $in: ['pending', 'preparing'] },
      $or: [
        { driver_id: null },
        { driver_id: '' }
      ]
    })
    .sort({ created_at: -1 })
    .lean();

    const formattedOrders = orders.map(order => ({
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

// POST /api/driver/orders/:orderId/accept - Accept an order for delivery
router.post('/orders/:orderId/accept', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const driverId = req.user.username;

    // Get the order
    const order = await Order.findOne({ id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Assign to driver and set status to out-for-delivery
    order.driver_id = driverId;
    order.status = 'out-for-delivery';
    order.updated_at = new Date();
    
    await order.save();

    res.json({
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
      updated_at: order.updated_at,
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

    const order = await Order.findOne({ id: orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only the assigned driver (or admin) can decline/unassign
    if (req.user.role !== ROLES.ADMIN && order.driver_id !== driverId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    order.driver_id = null;
    order.status = 'pending';
    order.updated_at = new Date();
    
    await order.save();

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/driver/orders/:orderId/deliver - Mark order as delivered
router.post('/orders/:orderId/deliver', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Get the order
    const order = await Order.findOne({ id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status to delivered
    order.status = 'delivered';
    order.updated_at = new Date();
    
    await order.save();

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/driver/my-deliveries - Get driver's delivery history
router.get('/my-deliveries', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const driverId = req.user.username;
    
    const current = await Order.find({
      driver_id: driverId,
      status: { $ne: 'delivered' }
    })
    .sort({ updated_at: -1 })
    .lean();

    const completed = await Order.find({
      driver_id: driverId,
      status: 'delivered'
    })
    .sort({ updated_at: -1 })
    .lean();

    const formatOrder = (o) => ({
      id: o.id,
      user_id: o.user_id ? o.user_id.toString() : null,
      items: o.items,
      subtotal: o.subtotal,
      tip: o.tip || 0,
      drop_off_location: o.drop_off_location,
      recipient_name: o.recipient_name,
      driver_id: o.driver_id,
      status: o.status,
      created_at: o.created_at,
      updated_at: o.updated_at
    });

    res.json({
      current: current.map(formatOrder),
      completed: completed.map(formatOrder)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/driver/stats - Driver earnings and analytics
router.get('/stats', verifyToken, requireRole(ROLES.DRIVER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const driverId = req.user.username;
    const delivered = await Order.find({
      driver_id: driverId,
      status: 'delivered'
    })
    .sort({ updated_at: -1 })
    .lean();

    // Earnings model: base $5 + 10% of subtotal per delivery (demo)
    const earningFor = (o) => 5 + 0.10 * Number(o.subtotal || 0);
    const totalEarnings = delivered.reduce((s, o) => s + earningFor(o), 0);
    const deliveriesCompleted = delivered.length;

    // Avg delivery time (minutes): updated_at - created_at
    const avgDeliveryTimeMin = delivered.length > 0 ? (
      delivered.reduce((s, o) => {
        const created = new Date(o.created_at);
        const updated = new Date(o.updated_at || o.created_at);
        return s + ((updated - created) / 60000);
      }, 0) / delivered.length
    ) : 0;

    // Weekly earnings breakdown (last 7 days by date)
    const byDay = {};
    for (const o of delivered) {
      const day = new Date(o.updated_at || o.created_at).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + earningFor(o);
    }

    const recent = delivered.slice(0, 5).map(o => ({
      id: o.id,
      total: o.subtotal,
      drop: o.drop_off_location,
      date: o.updated_at || o.created_at
    }));

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
