import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }
    
    // For prototype, accept any non-empty credentials
    onLogin(true)
    navigate('/') // redirect to Home
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
          
          <button type="submit" className="login-button">
            Sign In
          </button>
          
          <p className="login-notice">
            Prototype Mode: Any credentials accepted
          </p>
        </form>
      </div>
    </div>
  )
}
