import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  async function verifyToken() {
    try {
      const response = await authAPI.verify();
      if (response.valid) {
        setUser(response.user);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }

  function login(userData) {
    setUser(userData);
  }

  function logout() {
    authAPI.logout();
    setUser(null);
  }

  // Role check helper functions
  const isCustomer = user?.role === 'customer';
  const isDriver = user?.role === 'driver';
  const isRestaurantStaff = user?.role === 'restaurant_staff';
  const isAdmin = user?.role === 'admin';

  const canAccessAdmin = isAdmin;
  const canManageMenu = isRestaurantStaff || isAdmin;
  const canAcceptDeliveries = isDriver || isAdmin;
  const canViewOrders = isCustomer || isDriver || isRestaurantStaff || isAdmin;

  const value = {
    user,
    login,
    logout,
    loading,
    // Role flags
    isCustomer,
    isDriver,
    isRestaurantStaff,
    isAdmin,
    // Permission flags
    canAccessAdmin,
    canManageMenu,
    canAcceptDeliveries,
    canViewOrders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

