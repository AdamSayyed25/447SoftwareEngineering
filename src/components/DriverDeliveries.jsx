import React, { useEffect, useState } from 'react'
import { driverAPI } from '../services/api'

export default function DriverDeliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await driverAPI.getMyDeliveries()
      // data: { current: [], completed: [] }
      setDeliveries(data)
    } catch (e) {
      setError('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  const current = deliveries.current || []
  const completed = deliveries.completed || []

  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>My Deliveries</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {error && <div className="error">{error}</div>}

      <section>
        <h3>Current Deliveries</h3>
        {current.length === 0 ? (
          <p>No current deliveries</p>
        ) : (
          <div className="orders-list">
            {current.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                </div>
                <div className="order-info">
                  <p><strong>Drop-off:</strong> {order.drop_off_location}</p>
                  <p><strong>Total:</strong> ${order.subtotal.toFixed(2)}</p>
                  <p><strong>Items:</strong> {order.items.length}</p>
                  <p className="muted">{new Date(order.updated_at || order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <button className="accept-btn" onClick={async () => { await driverAPI.deliverOrder(order.id); await load(); }}>Mark as Delivered</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Completed Deliveries</h3>
        {completed.length === 0 ? (
          <p>No completed deliveries yet</p>
        ) : (
          <div className="orders-list">
            {completed.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span className="status-badge status-delivered">Delivered</span>
                </div>
                <div className="order-info">
                  <p><strong>Drop-off:</strong> {order.drop_off_location}</p>
                  <p><strong>Total:</strong> ${order.subtotal.toFixed(2)}</p>
                  <p className="muted">{new Date(order.updated_at || order.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
