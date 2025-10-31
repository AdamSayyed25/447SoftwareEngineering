import express from 'express';
import { dbAll, dbGet } from '../database/initDatabase.js';

const router = express.Router();

// GET /api/locations - Get all dining locations
router.get('/', async (req, res, next) => {
  try {
    const locations = await dbAll('SELECT * FROM locations ORDER BY name');
    res.json(locations);
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/:id - Get specific location
router.get('/:id', async (req, res, next) => {
  try {
    const location = await dbGet('SELECT * FROM locations WHERE id = ?', [req.params.id]);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/dropoffs - Get all drop-off locations
router.get('/dropoffs/all', async (req, res, next) => {
  try {
    const dropoffs = await dbAll('SELECT * FROM drop_off_locations ORDER BY name');
    res.json(dropoffs);
  } catch (err) {
    next(err);
  }
});

export default router;

