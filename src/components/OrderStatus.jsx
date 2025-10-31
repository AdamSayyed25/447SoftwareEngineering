import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ordersAPI } from '../services/api'

export default function OrderStatus() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [statusHistory, setStatusHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 2000) // Check every 2 seconds
    return () => clearInterval(interval)
  }, [orderId])

  async function loadOrder() {
    try {
      const foundOrder = await ordersAPI.getById(orderId)
      setOrder(foundOrder)
      updateStatusHistory(foundOrder)
      setError('')
    } catch (err) {
      console.error('Error loading order:', err)
      if (!order) {
        setError('Order not found')
      }
    }
  }

  function updateStatusHistory(order) {
    const history = [
      { status: 'Order Placed', time: order.created_at, icon: '📝', active: true }
    ]

    if (order.status === 'preparing') {
      history.push({ 
        status: 'Preparing', 
        time: order.updated_at || order.created_at, 
        icon: '👨‍🍳', 
        active: true 
      })
    }

    if (order.status === 'out-for-delivery') {
      history.push({ 
        status: 'Preparing', 
        time: order.created_at, 
        icon: '👨‍🍳', 
        active: false 
      })
      history.push({ 
        status: 'On the Way', 
        time: order.updated_at, 
        icon: '🏃', 
        active: true 
      })
    }

    if (order.status === 'delivered') {
      history.push({ 
        status: 'Preparing', 
        time: order.created_at, 
        icon: '👨‍🍳', 
        active: false 
      })
      history.push({ 
        status: 'Out for Delivery', 
        time: order.updated_at, 
        icon: '🚗', 
        active: false 
      })
      history.push({ 
        status: 'Delivered', 
        time: order.updated_at, 
        icon: '✅', 
        active: true, 
        completed: true 
      })
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

  if (error || !order) {
    return (
      <div className="page">
        <h2>Order Not Found</h2>
        <p>We couldn't find your order. It may have already been delivered.</p>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  const statusLabels = {
    'pending': 'Pending',
    'preparing': 'Preparing',
    'out-for-delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  }

  const estimatedArrival = order.status === 'delivered' 
    ? 'Delivered' 
    : order.status === 'out-for-delivery'
      ? '5-10 minutes'
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
            {statusLabels[order.status] || order.status}
          </div>
          <div className="est-time">
            <strong>Estimated Arrival:</strong> {estimatedArrival}
          </div>
        </div>

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
          <p><strong>Drop-off:</strong> {order.drop_off_location}</p>
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

      {order.status === 'delivered' && (
        <div className="delivery-complete">
          <div className="notice">
            🎉 Your order has been delivered! <Link to="/feedback">Leave Feedback</Link>
          </div>
        </div>
      )}
    </div>
  )
}

