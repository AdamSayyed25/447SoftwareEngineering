import express from 'express';
import { dbAll, dbGet } from '../database/initDatabase.js';

const router = express.Router();

// GET /api/menu/:locationId - Get menu for a specific location
router.get('/:locationId', async (req, res, next) => {
  try {
    const menu = await dbAll(
      'SELECT * FROM menu_items WHERE location_id = ? ORDER BY name',
      [req.params.locationId]
    );
    
    if (menu.length === 0) {
      return res.status(404).json({ error: 'Menu not found for this location' });
    }

    res.json(menu);
  } catch (err) {
    next(err);
  }
});

// GET /api/menu - Get all menu items across all locations
router.get('/', async (req, res, next) => {
  try {
    const menu = await dbAll('SELECT * FROM menu_items ORDER BY location_id, name');
    res.json(menu);
  } catch (err) {
    next(err);
  }
});

export default router;

