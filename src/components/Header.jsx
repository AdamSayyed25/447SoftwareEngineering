import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'

export default function Header() {
  const { items } = useCart()
  const { user, isCustomer, isDriver, isRestaurantStaff, isAdmin, logout } = useAuth()
  const count = items.reduce((s, i) => s + i.qty, 0)
  const navigate = useNavigate()
  const [logoutIndicator, setLogoutIndicator] = useState(false)

  const handleLogout = () => {
    vibrate(HAPTIC_PATTERNS.LIGHT)
    setLogoutIndicator(true)
    setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, 200)
  }

  return (
    <header className="app-header">
      <h1><Link to="/">UMBC DoorDash (Prototype)</Link></h1>
      <nav>
        {/* Customer Navigation */}
        {isCustomer && (
          <>
            <Link to="/">Home</Link>
            <Link to="/cart">Cart ({count})</Link>
            <Link to="/history">My Orders</Link>
          </>
        )}

        {/* Driver Navigation */}
        {isDriver && (
          <>
            <Link to="/driver">Driver Dashboard</Link>
            <Link to="/driver/deliveries">My Deliveries</Link>
          </>
        )}

        {/* Restaurant Staff Navigation */}
        {isRestaurantStaff && (
          <>
            <Link to="/restaurant">Restaurant Dashboard</Link>
            <Link to="/restaurant/menu">Menu Management</Link>
            <Link to="/restaurant/orders">Orders</Link>
          </>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <Link to="/admin">Admin Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/analytics">Analytics</Link>
          </>
        )}

        {/* Logout for all authenticated users */}
        {user && (
          <button onClick={handleLogout} className={`logout-btn ${logoutIndicator ? 'logging-out' : ''}`}>
            {logoutIndicator ? '✓ Logging Out...' : `Logout (${user.username})`}
          </button>
        )}
      </nav>
    </header>
  )
}
