import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function RequireDriver({ children }) {
  const { user, isDriver, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!(isDriver || isAdmin)) return <Navigate to="/" replace />
  return children
}

export function RequireStaff({ children }) {
  const { user, isRestaurantStaff, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!(isRestaurantStaff || isAdmin)) return <Navigate to="/" replace />
  return children
}

export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
