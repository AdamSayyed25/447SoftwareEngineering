import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../services/api'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const data = await ordersAPI.getAll()
      setOrders(data)
    } catch (err) {
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels = {
    'pending': 'Pending',
    'preparing': 'Preparing',
    'out-for-delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  }

  function getStatusBadge(order) {
    if (order.status === 'delivered') {
      return <span className="status-badge status-delivered">Delivered</span>
    }
    return <span className={`status-badge status-${order.status}`}>
      {statusLabels[order.status] || order.status}
    </span>
  }

  function getStatusText(order) {
    const labels = {
      'pending': 'Order placed',
      'preparing': 'Being prepared',
      'out-for-delivery': 'On the way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    }
    return labels[order.status] || 'Processing'
  }

  if (loading) return <div className="page">Loading orders...</div>

  if (orders.length === 0) {
    return (
      <div className="page order-history-page">
        <h2>Order History</h2>
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="browse-link">Browse Menus →</Link>
        </div>
      </div>
    )
  }

  // Separate active and completed orders
  const activeOrders = orders.filter(o => o.status !== 'delivered')
  const completedOrders = orders.filter(o => o.status === 'delivered')

  return (
    <div className="page order-history-page">
      <h2>My Orders</h2>
      
      {activeOrders.length > 0 && (
        <section className="orders-section">
          <h3 className="section-title">Active Orders</h3>
          <div className="orders-grid">
            {activeOrders.map(order => (
              <div key={order.id} className="order-history-card active">
                <div className="order-card-header">
                  <div>
                    <div className="order-id">Order #{order.id}</div>
                    <div className="order-date">{new Date(order.created_at).toLocaleString()}</div>
                  </div>
                  {getStatusBadge(order)}
                </div>
                
                <div className="order-status-text">
                  {getStatusText(order)}
                </div>
                
                <div className="order-items-preview">
                  {order.items.slice(0, 2).map(item => (
                    <div key={item.id} className="preview-item">
                      {item.name} × {item.qty}
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="more-items">+{order.items.length - 2} more items</div>
                  )}
                </div>
                
                <div className="order-total-preview">
                  Total: <strong>${order.subtotal.toFixed(2)}</strong>
                </div>
                
                <div className="order-actions">
                  <Link to={`/order/${order.id}`} className="track-btn">
                    Track Order →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completedOrders.length > 0 && (
        <section className="orders-section">
          <h3 className="section-title">Past Orders</h3>
          <div className="orders-list">
            {completedOrders.map(order => (
              <div key={order.id} className="order-history-card completed">
                <div className="order-card-header">
                  <div>
                    <div className="order-id">Order #{order.id}</div>
                    <div className="order-date">{new Date(order.created_at).toLocaleString()}</div>
                  </div>
                  {getStatusBadge(order)}
                </div>
                
                <div className="order-items-preview">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="preview-item">
                      {item.name} × {item.qty}
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="order-total-preview">
                    Total: <strong>${order.subtotal.toFixed(2)}</strong>
                  </div>
                  <Link to={`/order/${order.id}`} className="view-details-link">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

