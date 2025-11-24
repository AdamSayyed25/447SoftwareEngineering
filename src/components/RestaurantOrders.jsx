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

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000) // Poll every 15s
    return () => clearInterval(interval)
  }, [])

  async function updateStatus(orderId, newStatus) {
    try {
      await restaurantAPI.updateOrderStatus(orderId, newStatus)
      await load()
    } catch (e) {
      alert('Failed to update status')
    }
  }

  const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const completed = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled')

  if (loading) return <div>Loading orders...</div>

  return (
    <div className="orders-management">
      <div className="dashboard-header">
        <h3>Order Management</h3>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}

      <section>
        <h3>Active Orders ({active.length})</h3>
        {active.length === 0 ? <p className="muted">No active orders</p> : (
          <div className="orders-list">
            {active.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id.substring(0, 8)}...</h4>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                </div>
                <div className="order-info">
                  <p><strong>Customer:</strong> {order.recipient_name || 'Guest'}</p>
                  <p><strong>Items:</strong> {order.items.length} items</p>
                  <ul className="item-list-compact">
                    {order.items.map((item, idx) => (
                      <li key={idx}>1x {item.name}</li>
                    ))}
                  </ul>
                  <p><strong>Total:</strong> ${order.subtotal.toFixed(2)}</p>
                  <p className="muted">Placed: {new Date(order.created_at).toLocaleTimeString()}</p>

                  <div className="action-buttons" style={{ marginTop: 15, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {order.status === 'pending' && (
                      <button className="btn-primary small" onClick={() => updateStatus(order.id, 'preparing')}>
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button className="btn-primary small" onClick={() => updateStatus(order.id, 'ready')}>
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button className="btn-primary small" onClick={() => updateStatus(order.id, 'out-for-delivery')}>
                        Hand to Driver
                      </button>
                    )}
                    {(order.status === 'out-for-delivery' || order.status === 'ready') && (
                      <button className="accept-btn small" onClick={() => updateStatus(order.id, 'delivered')}>
                        Complete Order
                      </button>
                    )}
                    <button className="btn-secondary small" onClick={() => updateStatus(order.id, 'cancelled')}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>Completed / Past Orders</h3>
        {completed.length === 0 ? <p className="muted">No history</p> : (
          <div className="orders-list">
            {completed.slice(0, 10).map(order => (
              <div key={order.id} className="order-card muted-card">
                <div className="order-header">
                  <h4>#{order.id.substring(0, 8)}...</h4>
                  <span className={`status-badge status-${order.status}`}>{order.status}</span>
                </div>
                <div className="order-info">
                  <p>${order.subtotal.toFixed(2)} • {order.items.length} items</p>
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
