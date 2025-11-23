import express from 'express';
import { Feedback } from '../models/Feedback.js';

const router = express.Router();

// POST /api/feedback - Submit feedback
router.post('/', async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const feedback = new Feedback({
      order_id: orderId || null,
      rating,
      comment: comment || ''
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id.toString(),
        order_id: feedback.order_id,
        rating: feedback.rating,
        comment: feedback.comment,
        created_at: feedback.created_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback - Get all feedback
router.get('/', async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .sort({ created_at: -1 })
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

// GET /api/feedback/:orderId - Get feedback for specific order
router.get('/:orderId', async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ order_id: req.params.orderId }).lean();
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      id: feedback._id.toString(),
      order_id: feedback.order_id,
      rating: feedback.rating,
      comment: feedback.comment,
      created_at: feedback.created_at
    });
  } catch (err) {
    next(err);
  }
});

export default router;

