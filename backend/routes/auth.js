import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbRun, dbGet } from '../database/initDatabase.js';

const router = express.Router();

// Mock user credentials (prototype only - not using database yet)
const MOCK_USERS = [
  { username: 'student', password: 'password123', role: 'customer', id: 1 },
  { username: 'faculty', password: 'password123', role: 'customer', id: 2 },
  { username: 'driver1', password: 'password123', role: 'driver', id: 3 },
  { username: 'staff_caton', password: 'password123', role: 'restaurant_staff', id: 4, restaurant_location_id: 'caton' },
  { username: 'staff_dunk', password: 'password123', role: 'restaurant_staff', id: 5, restaurant_location_id: 'dunk' },
  { username: 'admin', password: 'admin123', role: 'admin', id: 6 }
];

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user in mock data
    const user = MOCK_USERS.find(u => u.username === username);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with role info
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // Add restaurant location for restaurant_staff
    if (user.restaurant_location_id) {
      tokenPayload.restaurant_location_id = user.restaurant_location_id;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'prototype-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        restaurant_location_id: user.restaurant_location_id || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/verify - Verify token
router.get('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'prototype-secret');

    res.json({
      valid: true,
      user: decoded
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

