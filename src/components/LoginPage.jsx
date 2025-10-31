import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      // Role-based redirect
      const role = result.user?.role
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'driver') navigate('/driver', { replace: true })
      else if (role === 'restaurant_staff') navigate('/restaurant', { replace: true })
      else navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <p className="login-notice">
            Demo: Use "student", "faculty", or "admin" with password "password123" or "admin123"
          </p>
        </form>
      </div>
    </div>
  )
}
