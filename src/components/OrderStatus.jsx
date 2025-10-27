import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

export default function OrderStatus() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [statusHistory, setStatusHistory] = useState([])

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 2000) // Check every 2 seconds
    return () => clearInterval(interval)
  }, [orderId])

  function loadOrder() {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const dasherOrders = JSON.parse(localStorage.getItem('dasherOrders') || '[]')
      
      let foundOrder = orders.find(o => o.id === orderId)
      
      if (foundOrder) {
        // Check if it was claimed by a dasher
        const claimedOrder = dasherOrders.find(o => o.id === orderId)
        if (claimedOrder) {
          foundOrder = { ...foundOrder, claimedBy: claimedOrder.claimedBy, claimedAt: claimedOrder.claimedAt, dasherStatus: claimedOrder.dasherStatus }
        }
        
        setOrder(foundOrder)
        updateStatusHistory(foundOrder)
      } else {
        // Check delivery history
        const history = JSON.parse(localStorage.getItem('deliveryHistory') || '[]')
        const historyOrder = history.find(o => o.id === orderId)
        if (historyOrder) {
          setOrder({ ...historyOrder, status: 'Delivered' })
          updateStatusHistory({ ...historyOrder, status: 'Delivered' })
        }
      }
    } catch (err) {
      console.error('Error loading order:', err)
    }
  }

  function updateStatusHistory(order) {
    const history = [
      { status: 'Order Placed', time: order.createdAt, icon: '📝', active: true }
    ]

    if (order.claimedBy) {
      history.push({ 
        status: 'Preparing', 
        time: order.createdAt, 
        icon: '👨‍🍳', 
        active: order.status !== 'Delivered' 
      })
      history.push({ 
        status: 'Picked Up by Dasher', 
        time: order.claimedAt, 
        icon: '🚗', 
        active: order.dasherStatus !== 'accepted' && order.status !== 'Delivered' 
      })
      history.push({ 
        status: 'On the Way', 
        time: order.claimedAt, 
        icon: '🏃', 
        active: order.status !== 'Delivered' 
      })
    }

    if (order.status === 'Delivered') {
      history.push({ status: 'Delivered', time: order.completedAt || new Date().toISOString(), icon: '✅', active: true, completed: true })
    }

    setStatusHistory(history)
  }

  function getEstimatedTime(status) {
    const times = {
      'Order Placed': '2-3 min',
      'Preparing': '5-10 min',
      'On the Way': '5-8 min',
      'Delivered': 'Arrived'
    }
    return times[status] || ''
  }

  if (!order) {
    return (
      <div className="page">
        <h2>Order Not Found</h2>
        <p>We couldn't find your order. It may have already been delivered.</p>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  const estimatedArrival = order.claimedBy 
    ? '5-10 minutes' 
    : order.status === 'Delivered' 
      ? 'Delivered' 
      : '10-15 minutes'

  return (
    <div className="page order-status-page">
      <div className="order-status-header">
        <h2>Order #{order.id}</h2>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      <div className="order-status-card">
        <div className="status-summary">
          <div className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
            {order.status === 'In Progress' && order.claimedBy ? 'On the Way' : order.status}
          </div>
          <div className="est-time">
            <strong>Estimated Arrival:</strong> {estimatedArrival}
          </div>
        </div>

        {order.claimedBy && (
          <div className="dasher-info">
            <p><strong>Dasher:</strong> {order.claimedBy}</p>
            <p className="muted">Your order is being delivered</p>
          </div>
        )}

        <div className="order-details">
          <h3>Your Order</h3>
          <div className="order-items-list">
            {order.items.map(item => (
              <div key={item.id} className="order-item">
                <span>{item.name} × {item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ${order.subtotal.toFixed(2)}</strong>
          </div>
        </div>

        <div className="order-location">
          <p><strong>Drop-off:</strong> {order.drop}</p>
          <p><strong>Recipient:</strong> {order.name}</p>
        </div>
      </div>

      <div className="status-timeline">
        <h3>Order Progress</h3>
        <div className="timeline">
          {statusHistory.map((step, idx) => (
            <div key={idx} className={`timeline-step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
              <div className="timeline-icon">{step.icon}</div>
              <div className="timeline-content">
                <div className="timeline-status">{step.status}</div>
                {step.time && (
                  <div className="timeline-time">
                    {new Date(step.time).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.status === 'Delivered' && (
        <div className="delivery-complete">
          <div className="notice">
            🎉 Your order has been delivered! <Link to="/feedback">Leave Feedback</Link>
          </div>
        </div>
      )}
    </div>
  )
}

