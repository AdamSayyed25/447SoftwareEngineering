import express from 'express';
import { MenuItem } from '../models/MenuItem.js';

const router = express.Router();

// GET /api/menu/:locationId - Get menu for a specific location
router.get('/:locationId', async (req, res, next) => {
  try {
    const menu = await MenuItem.find({ location_id: req.params.locationId })
      .sort({ name: 1 })
      .lean();

    if (menu.length === 0) {
      // Return empty array instead of 404 to allow frontend to show "No items" message
      return res.json([]);
    }

    // Format response to match frontend expectations
    const formattedMenu = menu.map(item => ({
      id: item.id,
      location_id: item.location_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category
    }));

    res.json(formattedMenu);
  } catch (err) {
    next(err);
  }
});

// GET /api/menu - Get all menu items across all locations
router.get('/', async (req, res, next) => {
  try {
    const menu = await MenuItem.find()
      .sort({ location_id: 1, name: 1 })
      .lean();

    const formattedMenu = menu.map(item => ({
      id: item.id,
      location_id: item.location_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category
    }));

    res.json(formattedMenu);
  } catch (err) {
    next(err);
  }
});

export default router;

