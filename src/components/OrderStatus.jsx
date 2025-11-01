import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ordersAPI, locationsAPI } from '../services/api'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'

export default function OrderStatus() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [statusHistory, setStatusHistory] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dropOffName, setDropOffName] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [orderId])

  async function loadOrder() {
    try {
      const foundOrder = await ordersAPI.getById(orderId)
      setOrder(foundOrder)
      updateStatusHistory(foundOrder)
      setLastUpdated(new Date())
      setError('')
      
      // Get drop-off location name
      if (foundOrder.drop_off_location) {
        try {
          const dropoffs = await locationsAPI.getDropoffs()
          const dropOff = dropoffs.find(d => d.code === foundOrder.drop_off_location)
          setDropOffName(dropOff ? dropOff.name : foundOrder.drop_off_location)
        } catch (e) {
          setDropOffName(foundOrder.drop_off_location)
        }
      }
    } catch (err) {
      console.error('Error loading order:', err)
      if (!order) {
        setError('Order not found')
      }
    }
  }

  async function handleRefresh() {
    setLoading(true)
    vibrate(HAPTIC_PATTERNS.LIGHT)
    await loadOrder()
    setLoading(false)
  }

  async function handleCancel() {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }
    
    setCancelling(true)
    try {
      await ordersAPI.updateStatus(orderId, 'cancelled')
      vibrate(HAPTIC_PATTERNS.SUCCESS)
      await loadOrder()
      alert('Order cancelled successfully')
    } catch (err) {
      alert(err.message || 'Failed to cancel order')
      vibrate(HAPTIC_PATTERNS.ERROR)
    } finally {
      setCancelling(false)
    }
  }

  function updateStatusHistory(order) {
    // Define all possible steps
    const allSteps = [
      { status: 'Order Placed', icon: '📝', key: 'placed' },
      { status: 'Preparing', icon: '👨‍🍳', key: 'preparing' },
      { status: 'Out for Delivery', icon: '🚗', key: 'out-for-delivery' },
      { status: 'Delivered', icon: '✅', key: 'delivered' }
    ]

    // Determine current status index
    const statusMap = {
      'pending': 0,
      'preparing': 1,
      'out-for-delivery': 2,
      'delivered': 3,
      'cancelled': -1
    }

    const currentIndex = statusMap[order.status] || 0

    // Build history with all steps
    const history = allSteps.map((step, idx) => {
      const isCompleted = idx < currentIndex
      const isActive = idx === currentIndex
      const isPending = idx > currentIndex

      return {
        ...step,
        time: isCompleted || isActive ? (order.updated_at || order.created_at) : null,
        active: isActive && order.status !== 'cancelled',
        completed: isCompleted,
        pending: isPending || order.status === 'cancelled'
      }
    })

    // Add cancelled step if cancelled
    if (order.status === 'cancelled') {
      history.push({
        status: 'Cancelled',
        icon: '❌',
        key: 'cancelled',
        time: order.updated_at || order.created_at,
        active: true,
        completed: false,
        cancelled: true
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
      : order.status === 'preparing'
        ? '10-15 minutes'
        : '15-20 minutes'

  // Calculate breakdown
  // Note: order.subtotal from backend is cart subtotal + tip (doesn't include tax)
  const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const tip = order.tip || 0
  const tax = itemsSubtotal * 0.08 // 8% tax (mocked, not stored in backend)
  const finalTotal = (itemsSubtotal + tax + tip).toFixed(2) // Calculate total with tax

  // Check if order can be cancelled (not yet out for delivery)
  const canCancel = ['pending', 'preparing'].includes(order.status)

  return (
    <div className="page order-status-page">
      <div className="order-status-header">
        <h2>Order #{order.id}</h2>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
          <Link to="/" className="back-link">← Home</Link>
        </div>
      </div>

      {lastUpdated && (
        <p className="last-updated">Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}

      <div className="order-status-card">
        <div className="status-summary">
          <div>
            <div className={`status-badge status-${order.status.toLowerCase().replace('-', '-')}`}>
              {statusLabels[order.status] || order.status}
            </div>
            {canCancel && (
              <button 
                onClick={handleCancel}
                disabled={cancelling}
                className="cancel-order-btn"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
          <div className="est-time">
            <span className="est-label">Estimated Arrival:</span>
            <span className="est-value">{estimatedArrival}</span>
          </div>
        </div>

        <div className="order-details">
          <h3 className="section-title">Your Order</h3>
          <div className="order-items-list">
            {order.items.map(item => (
              <div key={item.id} className="order-item">
                <span className="item-name">{item.name} × {item.qty}</span>
                <span className="item-price">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-breakdown">
            <div className="breakdown-row">
              <span className="breakdown-label">Items:</span>
              <span className="breakdown-value">${itemsSubtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="breakdown-row">
                <span className="breakdown-label">Tax & Fees:</span>
                <span className="breakdown-value">${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="breakdown-row">
              <span className="breakdown-label">Subtotal:</span>
              <span className="breakdown-value">${(itemsSubtotal + tax).toFixed(2)}</span>
            </div>
            {tip > 0 && (
              <div className="breakdown-row">
                <span className="breakdown-label">Tip:</span>
                <span className="breakdown-value">${tip.toFixed(2)}</span>
              </div>
            )}
            <div className="breakdown-row total-row">
              <span className="breakdown-label">Total:</span>
              <span className="breakdown-value total-value">${finalTotal}</span>
            </div>
          </div>
        </div>

        <div className="order-location">
          <span className="location-label">Drop-off Location:</span>
          <span className="location-value">{dropOffName || order.drop_off_location}</span>
        </div>
      </div>

      <div className="status-timeline">
        <div className="timeline-header">
          <h3 className="section-title">Order Progress</h3>
        </div>
        <div className="timeline">
          {statusHistory.map((step, idx) => (
            <div 
              key={idx} 
              className={`timeline-step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''} ${step.pending ? 'pending' : ''} ${step.cancelled ? 'cancelled' : ''}`}
            >
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

      <div className="order-actions">
        <Link to="/feedback" className="help-link">Need Help with this Order?</Link>
        {order.status === 'delivered' && (
          <Link to="/feedback" className="feedback-link">Leave Feedback</Link>
        )}
      </div>
    </div>
  )
}

