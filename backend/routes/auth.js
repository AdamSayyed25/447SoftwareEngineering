import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Google OAuth Client (only if GOOGLE_CLIENT_ID is provided)
let client = null;
if (process.env.GOOGLE_CLIENT_ID) {
  client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID not set. Google OAuth features will be disabled.');
}

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create new user (default role is 'customer')
    const user = new User({
      email: email.toLowerCase(),
      username,
      password_hash,
      role: 'customer'
    });

    await user.save();

    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'prototype-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        restaurant_location_id: user.restaurant_location_id || null
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      if (err.keyPattern?.email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (err.keyPattern?.username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user in database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with role info
    const tokenPayload = {
      id: user._id.toString(),
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
        id: user._id.toString(),
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

// Helper function to verify Google token
async function verifyGoogleToken(token) {
  if (!client) {
    throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables.');
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
      google_id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

// POST /api/auth/google/register - Register with Google
router.post('/google/register', async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token required' });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: googleUser.email.toLowerCase() },
        { google_id: googleUser.google_id }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Account already exists. Please sign in instead.' });
    }

    // Generate username from email (before @ symbol)
    const usernameFromEmail = googleUser.email.split('@')[0];
    let username = usernameFromEmail;
    let usernameExists = await User.findOne({ username });

    // If username exists, append random number
    if (usernameExists) {
      username = `${usernameFromEmail}${Math.floor(Math.random() * 10000)}`;
    }

    // Create new user with Google auth
    const user = new User({
      email: googleUser.email.toLowerCase(),
      username,
      password_hash: null, // No password for Google users
      google_id: googleUser.google_id,
      auth_provider: 'google',
      role: 'customer'
    });

    await user.save();

    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'prototype-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully with Google',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        restaurant_location_id: user.restaurant_location_id || null,
        auth_provider: user.auth_provider
      }
    });
  } catch (err) {
    if (err.message === 'Invalid Google token') {
      return res.status(401).json({ error: 'Invalid Google authentication token' });
    }
    next(err);
  }
});



// POST /api/auth/google/login - Sign in with Google
router.post('/google/login', async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token required' });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);

    // Find user by Google ID or email
    const user = await User.findOne({
      $or: [
        { google_id: googleUser.google_id },
        { email: googleUser.email.toLowerCase(), auth_provider: 'google' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Account not found. Please create an account first.',
        requiresRegistration: true
      });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email
    };

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
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        restaurant_location_id: user.restaurant_location_id || null,
        auth_provider: user.auth_provider
      }
    });
  } catch (err) {
    if (err.message === 'Invalid Google token') {
      return res.status(401).json({ error: 'Invalid Google authentication token' });
    }
    next(err);
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      restaurant_location_id: user.restaurant_location_id
    });
  } catch (err) {
    next(err);
  }
});

export default router;
