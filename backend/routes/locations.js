import express from 'express';
import { Location } from '../models/Location.js';
import { DropOffLocation } from '../models/DropOffLocation.js';

const router = express.Router();

// GET /api/locations - Get all dining locations
router.get('/', async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 }).lean();
    // Convert _id to id for consistency with frontend
    const formattedLocations = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      hours: loc.hours,
      address: loc.address
    }));
    res.json(formattedLocations);
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/:id - Get specific location
router.get('/:id', async (req, res, next) => {
  try {
    const location = await Location.findOne({ id: req.params.id }).lean();
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      id: location.id,
      name: location.name,
      hours: location.hours,
      address: location.address
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/dropoffs/all - Get all drop-off locations
router.get('/dropoffs/all', async (req, res, next) => {
  try {
    const dropoffs = await DropOffLocation.find().sort({ name: 1 }).lean();
    // Convert to expected format
    const formattedDropoffs = dropoffs.map(drop => ({
      code: drop.code,
      name: drop.name
    }));
    res.json(formattedDropoffs);
  } catch (err) {
    next(err);
  }
});

export default router;

