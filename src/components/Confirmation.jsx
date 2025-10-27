import React from 'react'
import { useLocation, Link } from 'react-router-dom'

export default function Confirmation() {
  const { state } = useLocation()
  const order = state?.order

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
      
      <div className="order-confirmed-card">
        <div className="success-icon">✓</div>
        <p className="confirmation-message">Your order has been placed successfully</p>
        
        <div className="order-info">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Drop-off:</strong> {order.drop}</p>
          <p><strong>Total:</strong> ${order.subtotal.toFixed(2)}</p>
          <p className="muted">Placed: {new Date(order.createdAt).toLocaleString()}</p>
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
