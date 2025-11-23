import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe with secret key from environment
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables. Payment functionality will not work.');
  } else {
    stripe = new Stripe("REMOVED_SECRET");
     

  }
} catch (err) {
  console.error('Failed to initialize Stripe:', err);
}

// POST /api/payment/create-payment-intent - Create a payment intent
router.post('/create-payment-intent', async (req, res, next) => {
  try {
    if (!stripe) {

      console.log("check")
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in backend .env file.' 
        
      });
    }

    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        created_at: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error('Stripe payment intent error:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to create payment intent' 
    });
  }
});

// POST /api/payment/confirm - Confirm payment intent (optional webhook alternative)
router.post('/confirm', async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    });
  } catch (err) {
    console.error('Stripe payment confirmation error:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to confirm payment' 
    });
  }
});

export default router;

