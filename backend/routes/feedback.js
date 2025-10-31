import express from 'express';
import { dbRun, dbGet, dbAll } from '../database/initDatabase.js';

const router = express.Router();

// POST /api/feedback - Submit feedback
router.post('/', async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    await dbRun(`
      INSERT INTO feedback (order_id, rating, comment)
      VALUES (?, ?, ?)
    `, [orderId || null, rating, comment || '']);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback - Get all feedback
router.get('/', async (req, res, next) => {
  try {
    const feedback = await dbAll('SELECT * FROM feedback ORDER BY created_at DESC');
    res.json(feedback);
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback/:orderId - Get feedback for specific order
router.get('/:orderId', async (req, res, next) => {
  try {
    const feedback = await dbGet(
      'SELECT * FROM feedback WHERE order_id = ?',
      [req.params.orderId]
    );
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (err) {
    next(err);
  }
});

export default router;

