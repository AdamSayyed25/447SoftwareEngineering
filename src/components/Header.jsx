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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    vibrate(HAPTIC_PATTERNS.LIGHT)
    setLogoutIndicator(true)
    setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, 200)
  }

  const toggleMobileMenu = () => {
    vibrate(HAPTIC_PATTERNS.LIGHT)
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="app-header">
      <h1><Link to="/" onClick={closeMobileMenu}>UMBC DoorDash (Prototype)</Link></h1>
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      <nav className={mobileMenuOpen ? 'mobile-open' : ''}>
        {/* Customer Navigation */}
        {isCustomer && (
          <>
            <Link to="/" onClick={closeMobileMenu}>Home</Link>
            <Link to="/cart" onClick={closeMobileMenu}>Cart ({count})</Link>
            <Link to="/history" onClick={closeMobileMenu}>My Orders</Link>
          </>
        )}

        {/* Driver Navigation */}
        {isDriver && (
          <>
            <Link to="/driver" onClick={closeMobileMenu}>Driver Dashboard</Link>
            <Link to="/driver/deliveries" onClick={closeMobileMenu}>My Deliveries</Link>
            <Link to="/driver/stats" onClick={closeMobileMenu}>Stats</Link>
          </>
        )}

        {/* Restaurant Staff Navigation */}
        {isRestaurantStaff && (
          <>
            <Link to="/restaurant" onClick={closeMobileMenu}>Restaurant Dashboard</Link>
            <Link to="/restaurant/menu" onClick={closeMobileMenu}>Menu Management</Link>
            <Link to="/restaurant/orders" onClick={closeMobileMenu}>Orders</Link>
          </>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <Link to="/admin" onClick={closeMobileMenu}>Admin Dashboard</Link>
            <Link to="/admin/users" onClick={closeMobileMenu}>Users</Link>
            <Link to="/admin/analytics" onClick={closeMobileMenu}>Analytics</Link>
            <Link to="/admin/locations" onClick={closeMobileMenu}>Locations</Link>
          </>
        )}

        {/* Logout for all authenticated users */}
        {user && (
          <button onClick={() => { closeMobileMenu(); handleLogout(); }} className={`logout-btn ${logoutIndicator ? 'logging-out' : ''}`}>
            {logoutIndicator ? '✓ Logging Out...' : `Logout (${user.username})`}
          </button>
        )}
      </nav>
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </header>
  )
}
