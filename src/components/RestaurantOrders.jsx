import React, { useEffect, useState } from 'react'
import { restaurantAPI } from '../services/api'

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await restaurantAPI.getOrders()
      setOrders(data)
    } catch (e) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const active = orders.filter(o => o.status !== 'delivered')
  const completed = orders.filter(o => o.status === 'delivered')

  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>Restaurant Orders</h2>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}

      <section>
        <h3>Active Orders</h3>
        {active.length === 0 ? <p>No active orders</p> : (
          <div className="orders-list">
            {active.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                </div>
                <div className="order-info">
                  <p><strong>Total:</strong> ${order.subtotal.toFixed(2)}</p>
                  <p><strong>Items:</strong> {order.items.length}</p>
                  <p className="muted">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Completed</h3>
        {completed.length === 0 ? <p>No completed orders</p> : (
          <div className="orders-list">
            {completed.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span className="status-badge status-delivered">Delivered</span>
                </div>
                <div className="order-info">
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
