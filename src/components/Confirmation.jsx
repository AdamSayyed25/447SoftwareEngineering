import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'

export default function Confirmation() {
  const { state } = useLocation()
  const order = state?.order
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    vibrate(HAPTIC_PATTERNS.SUCCESS)
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  if (!order)
    return (
      <div className="page">
        <h2>No recent order</h2>
        <Link to="/">Back to Home</Link>
      </div>
    )

  return (
    <div className="page confirmation-page">
      <h2>Order Confirmed!</h2>
      
      <div className={`order-confirmed-card ${isVisible ? 'visible' : ''}`}>
        <div className="success-icon success-bounce">✓</div>
        <p className="confirmation-message">Purchase Complete</p>
        
        <div className="order-info">
          <div className="info-row">
            <span className="info-label">Order ID:</span>
            <span className="info-value">{order.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Drop-off Location:</span>
            <span className="info-value">{order.drop || 'N/A'}</span>
          </div>
          <div className="order-breakdown">
            <div className="breakdown-row">
              <span className="breakdown-label">Subtotal:</span>
              <span className="breakdown-value">${(order.subtotal - (order.tip || 0)).toFixed(2)}</span>
            </div>
            {order.tip > 0 && (
              <div className="breakdown-row">
                <span className="breakdown-label">Tip:</span>
                <span className="breakdown-value">${order.tip.toFixed(2)}</span>
              </div>
            )}
            <div className="breakdown-row total-row">
              <span className="breakdown-label">Total:</span>
              <span className="breakdown-value total-value">${order.subtotal.toFixed(2)}</span>
            </div>
          </div>
          <p className="order-time muted">Placed: {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="confirmation-actions">
          <Link to={`/order/${order.id}`} className="track-order-btn">
            Track Your Order →
          </Link>
          <Link to="/feedback" className="feedback-link">Leave Feedback</Link>
        </div>
      </div>
    </div>
  )
}
