import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'
import { initializeGoogleSignIn, getGoogleClientId } from '../utils/googleAuth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successIndicator, setSuccessIndicator] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      vibrate(HAPTIC_PATTERNS.ERROR)
      return
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      vibrate(HAPTIC_PATTERNS.ERROR)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      vibrate(HAPTIC_PATTERNS.ERROR)
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      vibrate(HAPTIC_PATTERNS.ERROR)
      return
    }
    
    setLoading(true)
    try {
      const result = await authAPI.register(email, username, password)
      login(result.user)
      vibrate(HAPTIC_PATTERNS.SUCCESS)
      setSuccessIndicator(true)
      setTimeout(() => {
        // Redirect to home page after successful registration
        navigate('/', { replace: true })
      }, 500)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      vibrate(HAPTIC_PATTERNS.ERROR)
    } finally {
      setLoading(false)
    }
  }

  // Google Register handler
  const handleGoogleRegister = useCallback(async (response) => {
    setError('')
    setLoading(true)
    try {
      const result = await authAPI.googleRegister(response.credential)
      login(result.user)
      vibrate(HAPTIC_PATTERNS.SUCCESS)
      setSuccessIndicator(true)
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 500)
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        setError('Account already exists. Please sign in instead.')
        vibrate(HAPTIC_PATTERNS.ERROR)
      } else {
        setError(err.message || 'Google registration failed. Please try again.')
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
      initializeGoogleSignIn(clientId, handleGoogleRegister, true)
    } else if (clientId) {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (typeof window.google !== 'undefined' && window.google.accounts) {
          clearInterval(checkGoogle)
          initializeGoogleSignIn(clientId, handleGoogleRegister, true)
        }
      }, 100)
      return () => clearInterval(checkGoogle)
    }
  }, [handleGoogleRegister])

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">Join UMBC DoorDash</p>
        
        <form onSubmit={handleRegister} className="login-form">
          {error && <div className="login-error">{error}</div>}
          {successIndicator && (
            <div className="login-success">
              ✓ Account created successfully! Redirecting...
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div id="google-register-btn"></div>
          
          <p className="login-notice">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

