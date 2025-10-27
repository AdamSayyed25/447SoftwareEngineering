import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 2000) // Auto-refresh
    return () => clearInterval(interval)
  }, [])

  function loadOrders() {
    try {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      const dasherOrders = JSON.parse(localStorage.getItem('dasherOrders') || '[]')
      const history = JSON.parse(localStorage.getItem('deliveryHistory') || '[]')
      
      // Merge all orders with status
      const ordersWithStatus = []
      
      // Add in-progress orders
      allOrders.forEach(order => {
        const claimedOrder = dasherOrders.find(o => o.id === order.id)
        if (claimedOrder) {
          ordersWithStatus.push({
            ...order,
            claimedBy: claimedOrder.claimedBy,
            claimedAt: claimedOrder.claimedAt,
            status: 'In Progress'
          })
        } else {
          ordersWithStatus.push(order)
        }
      })
      
      // Add completed orders from history
      history.forEach(order => {
        if (!ordersWithStatus.find(o => o.id === order.id)) {
          ordersWithStatus.push({ ...order, status: 'Delivered' })
        }
      })
      
      // Sort by date (newest first)
      ordersWithStatus.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.claimedAt || a.createdAt)
        const dateB = new Date(b.completedAt || b.claimedAt || b.createdAt)
        return dateB - dateA
      })
      
      setOrders(ordersWithStatus)
    } catch (err) {
      console.error('Error loading orders:', err)
    }
  }

  function getStatusBadge(order) {
    if (order.status === 'Delivered') {
      return <span className="status-badge status-delivered">Delivered</span>
    }
    if (order.claimedBy) {
      return <span className="status-badge status-in-progress">On the Way</span>
    }
    return <span className="status-badge status-in-progress">Preparing</span>
  }

  function getStatusText(order) {
    if (order.status === 'Delivered') {
      return 'Delivered'
    }
    if (order.claimedBy) {
      return `Being delivered by ${order.claimedBy}`
    }
    return 'Being prepared'
  }

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
  const activeOrders = orders.filter(o => o.status !== 'Delivered')
  const completedOrders = orders.filter(o => o.status === 'Delivered')

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
                    <div className="order-date">{new Date(order.createdAt).toLocaleString()}</div>
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
                    <div className="order-date">{new Date(order.createdAt).toLocaleString()}</div>
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

