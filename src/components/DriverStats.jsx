import React, { useEffect, useState } from 'react'
import { driverAPI } from '../services/api'

export default function DriverStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await driverAPI.getStats()
      setStats(data)
    } catch (e) {
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="page">Loading...</div>
  if (!stats) return <div className="page">{error || 'No data'}</div>

  const days = Object.keys(stats.weekly).sort()

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>Driver Stats</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p className="stat-number">${stats.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Deliveries Completed</h3>
          <p className="stat-number">{stats.deliveriesCompleted}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Delivery Time</h3>
          <p className="stat-number">{stats.avgDeliveryTimeMin} min</p>
        </div>
      </div>

      <section>
        <h3>Weekly Earnings</h3>
        {days.length === 0 ? (
          <p>No earnings yet</p>
        ) : (
          <div className="orders-list">
            {days.map(d => (
              <div key={d} className="order-card">
                <div className="order-header">
                  <h4>{d}</h4>
                  <span className="status-badge">${stats.weekly[d].toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Recent Deliveries</h3>
        {stats.recent.length === 0 ? <p>No recent deliveries</p> : (
          <div className="orders-list">
            {stats.recent.map(r => (
              <div key={r.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{r.id}</h4>
                  <span className="status-badge">${r.total.toFixed(2)}</span>
                </div>
                <div className="order-info">
                  <p><strong>Drop-off:</strong> {r.drop}</p>
                  <p className="muted">{new Date(r.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
