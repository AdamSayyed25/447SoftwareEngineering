import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await adminAPI.getStats()
      setStats(data)
    } catch (e) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className="page">Loading...</div>
  if (!stats) return <div className="page">{error || 'No data'}</div>

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>Analytics</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.orders.total}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-number">${(stats.revenue.total || 0).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Users</h3>
          <p className="stat-number">{stats.users.total}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Rating</h3>
          <p className="stat-number">{(stats.feedback.average_rating || 0).toFixed(1)}</p>
        </div>
      </div>

      <section>
        <h3>Order Status Breakdown</h3>
        <div className="order-status-breakdown">
          <div className="status-item"><span className="status-label">Pending</span><span className="status-value">{stats.orders.pending}</span></div>
          <div className="status-item"><span className="status-label">Preparing</span><span className="status-value">{stats.orders.preparing}</span></div>
          <div className="status-item"><span className="status-label">Out</span><span className="status-value">{stats.orders.out_for_delivery}</span></div>
          <div className="status-item"><span className="status-label">Delivered</span><span className="status-value">{stats.orders.delivered}</span></div>
        </div>
      </section>
    </div>
  )
}
