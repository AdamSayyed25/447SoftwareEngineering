import jwt from 'jsonwebtoken';

// Verify JWT token and attach user to request
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'prototype-secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Check if user has one of the allowed roles
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Role definitions
export const ROLES = {
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  RESTAURANT_STAFF: 'restaurant_staff',
  ADMIN: 'admin'
};

// Permission checks
export function canViewOrders(user) {
  return user.role === ROLES.CUSTOMER || 
         user.role === ROLES.DRIVER || 
         user.role === ROLES.RESTAURANT_STAFF || 
         user.role === ROLES.ADMIN;
}

export function canModifyMenu(user, locationId) {
  return user.role === ROLES.RESTAURANT_STAFF || 
         user.role === ROLES.ADMIN;
}

export function canManageUsers(user) {
  return user.role === ROLES.ADMIN;
}

export function canAcceptDeliveries(user) {
  return user.role === ROLES.DRIVER || user.role === ROLES.ADMIN;
}

