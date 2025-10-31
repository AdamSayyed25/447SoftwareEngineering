import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await adminAPI.getUsers()
      setUsers(data)
    } catch (e) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>User Management</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="orders-list">
        {users.map(u => (
          <div key={u.id} className="order-card">
            <div className="order-header">
              <h4>{u.username}</h4>
              <span className={`status-badge`}>{u.role}</span>
            </div>
            <div className="order-info">
              <p><strong>Role:</strong> {u.role}</p>
              {u.restaurant_location_id && (
                <p><strong>Restaurant:</strong> {u.restaurant_location_id}</p>
              )}
              <p className="muted">Joined {new Date(u.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
