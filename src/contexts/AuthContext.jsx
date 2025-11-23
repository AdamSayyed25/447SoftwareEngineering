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
      // First verify the token is valid
      const response = await authAPI.verify();
      if (response.valid) {
        // If valid, fetch the latest user profile to ensure we have up-to-date data
        // (e.g., in case restaurant assignment changed)
        try {
          const userProfile = await authAPI.getProfile();
          setUser(userProfile);
        } catch (profileErr) {
          console.warn('Failed to fetch fresh profile, falling back to token data', profileErr);
          setUser(response.user);
        }
      } else {
        logout();
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

