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
    <div className="page">
      <h2>Order Confirmed</h2>
      <p>Order ID: <strong>{order.id}</strong></p>
      <p>Status: {order.status}</p>
      <p>Drop-off: {order.drop}</p>
      <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
      <Link to="/feedback">Leave Feedback</Link>
    </div>
  )
}
