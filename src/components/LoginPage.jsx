import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'
import { initializeGoogleSignIn, getGoogleClientId } from '../utils/googleAuth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successIndicator, setSuccessIndicator] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }
    
    setLoading(true)
    try {
      const result = await authAPI.login(username, password)
      login(result.user)
      vibrate(HAPTIC_PATTERNS.LIGHT)
      setSuccessIndicator(true)
      setTimeout(() => {
        const role = result.user?.role
        if (role === 'admin') navigate('/admin', { replace: true })
        else if (role === 'driver') navigate('/driver', { replace: true })
        else if (role === 'restaurant_staff') navigate('/restaurant', { replace: true })
        else navigate('/', { replace: true })
      }, 300)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
      vibrate(HAPTIC_PATTERNS.ERROR)
    } finally {
      setLoading(false)
    }
  }

  // Google Sign-In handler
  const handleGoogleSignIn = useCallback(async (response) => {
    setError('')
    setLoading(true)
    try {
      const result = await authAPI.googleLogin(response.credential)
      login(result.user)
      vibrate(HAPTIC_PATTERNS.LIGHT)
      setSuccessIndicator(true)
      setTimeout(() => {
        const role = result.user?.role
        if (role === 'admin') navigate('/admin', { replace: true })
        else if (role === 'driver') navigate('/driver', { replace: true })
        else if (role === 'restaurant_staff') navigate('/restaurant', { replace: true })
        else navigate('/', { replace: true })
      }, 300)
    } catch (err) {
      if (err.message && err.message.includes('Account not found')) {
        setError('Account not found. Please create an account first.')
        vibrate(HAPTIC_PATTERNS.ERROR)
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.')
        vibrate(HAPTIC_PATTERNS.ERROR)
      }
    } finally {
      setLoading(false)
    }
  }, [login, navigate])

  // Initialize Google Sign-In on mount
  useEffect(() => {
    const clientId = getGoogleClientId()
    if (clientId && typeof window.google !== 'undefined') {
      initializeGoogleSignIn(clientId, handleGoogleSignIn, false)
    } else if (clientId) {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (typeof window.google !== 'undefined' && window.google.accounts) {
          clearInterval(checkGoogle)
          initializeGoogleSignIn(clientId, handleGoogleSignIn, false)
        }
      }, 100)
      return () => clearInterval(checkGoogle)
    }
  }, [handleGoogleSignIn])

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">UMBC DoorDash</h2>
        <p className="login-subtitle">Campus Dining Login</p>
        
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div id="google-signin-btn"></div>
          
          <p className="login-notice">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
          <p className="login-notice" style={{ marginTop: '8px', fontSize: '12px' }}>
            Demo: Use "student", "faculty", or "admin" with password "password123" or "admin123"
          </p>
        </form>
      </div>
    </div>
  )
}
