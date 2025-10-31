import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function AdminLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await adminAPI.getLocations()
      setLocations(data)
    } catch (e) {
      setError('Failed to load locations')
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
        <h2>Locations</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="orders-list">
        {locations.map(l => (
          <div key={l.id} className="order-card">
            <div className="order-header">
              <h4>{l.name}</h4>
              <span className="status-badge">{l.id}</span>
            </div>
            <div className="order-info">
              <p><strong>Address:</strong> {l.address}</p>
              <p><strong>Hours:</strong> {l.hours}</p>
              <p><strong>Menu Items:</strong> {l.menu_items_count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
