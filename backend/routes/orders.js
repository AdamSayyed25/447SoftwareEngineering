import express from 'express';
import { Order } from '../models/Order.js';
import Stripe from 'stripe';

// Initialize Stripe (using same key as payment.js)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Simple UUID generator (for prototype)
function generateOrderId() {
  return Math.random().toString(36).substring(2, 15).toUpperCase();
}

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', async (req, res, next) => {
  try {
    const { items, subtotal, dropOffLocation, recipientName, tip, paymentIntentId } = req.body;

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
    const now = new Date();
    const tipAmount = tip || 0;

    let paymentMethodDetails = null;
    if (paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.payment_method) {
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
          paymentMethodDetails = {
            brand: paymentMethod.card?.brand,
            last4: paymentMethod.card?.last4
          };
        }
      } catch (error) {
        console.error('Failed to retrieve payment details:', error);
      }
    }

    // Extract unique restaurant IDs from items
    const restaurantIds = [...new Set(items.map(item => item.location_id).filter(Boolean))];

    const order = new Order({
      id: orderId,
      items,
      subtotal,
      drop_off_location: dropOffLocation,
      recipient_name: recipientName || null,
      tip: tipAmount,
      payment_intent_id: paymentIntentId || null,
      payment_method_details: paymentMethodDetails,
      status: 'pending',
      restaurant_ids: restaurantIds,
      created_at: now,
      updated_at: now
    });

    await order.save();

    const responseOrder = {
      id: order.id,
      items: order.items,
      subtotal: order.subtotal,
      tip: order.tip,
      drop: order.drop_off_location,
      recipient_name: order.recipient_name,
      status: order.status,
      createdAt: order.created_at.toISOString()
    };

    res.status(201).json(responseOrder);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:orderId - Get specific order
router.get('/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findOne({ id: req.params.orderId }).lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format response
    const formattedOrder = {
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
    };

    res.json(formattedOrder);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders - Get all orders (for demo purposes)
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    // Format response
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

// PATCH /api/orders/:orderId/status - Update order status
router.patch('/:orderId/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      updated_at: new Date()
    };

    // Update specific timestamps based on status
    if (status === 'preparing') updateData.prepared_at = new Date();
    if (status === 'out-for-delivery') updateData.picked_up_at = new Date();
    if (status === 'delivered') updateData.delivered_at = new Date();
    if (status === 'cancelled') updateData.cancelled_at = new Date();

    const order = await Order.findOneAndUpdate(
      { id: req.params.orderId },
      updateData,
      { new: true, lean: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const formattedOrder = {
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
    };

    res.json(formattedOrder);
  } catch (err) {
    next(err);
  }
});

export default router;

