import React, { useState, useEffect } from 'react'
import { DROP_OFFS, LOCATIONS } from '../data/mockData'

export default function DasherDashboard() {
  const [orders, setOrders] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [deliveryHistory, setDeliveryHistory] = useState([])
  const [dasherName, setDasherName] = useState(() => localStorage.getItem('dasherName') || '')
  const [earnings, setEarnings] = useState(() => parseFloat(localStorage.getItem('dasherEarnings') || '0'))

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 2000)
    return () => clearInterval(interval)
  }, [])

  function loadOrders() {
    try {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      const dasherOrders = JSON.parse(localStorage.getItem('dasherOrders') || '[]')
      const history = JSON.parse(localStorage.getItem('deliveryHistory') || '[]')
      
      setOrders(allOrders)
      setMyOrders(dasherOrders)
      setDeliveryHistory(history)
    } catch (err) {
      console.error('Error loading orders:', err)
    }
  }

  function acceptOrder(order) {
    if (!dasherName.trim()) {
      alert('Please enter your dasher name first!')
      return
    }
    
    const acceptedOrder = { ...order, claimedBy: dasherName, claimedAt: new Date().toISOString(), dasherStatus: 'accepted' }
    const dasherOrders = JSON.parse(localStorage.getItem('dasherOrders') || '[]')
    dasherOrders.push(acceptedOrder)
    localStorage.setItem('dasherOrders', JSON.stringify(dasherOrders))
    loadOrders()
  }

  function markAsDelivered(orderId) {
    const dasherOrders = JSON.parse(localStorage.getItem('dasherOrders') || '[]')
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const historyOrders = JSON.parse(localStorage.getItem('deliveryHistory') || '[]')
    
    // Find the order
    const order = dasherOrders.find(o => o.id === orderId)
    if (!order) return
    
    // Add to history
    historyOrders.push({ ...order, completedAt: new Date().toISOString() })
    localStorage.setItem('deliveryHistory', JSON.stringify(historyOrders))

    // Calculate earnings (simulated $2 per order + 10% tip)
    const orderEarnings = order.subtotal * 0.1 + 2
    const newEarnings = earnings + orderEarnings
    setEarnings(newEarnings)
    localStorage.setItem('dasherEarnings', newEarnings.toFixed(2))

    // Remove from dasher's active orders
    const remaining = dasherOrders.filter(o => o.id !== orderId)
    localStorage.setItem('dasherOrders', JSON.stringify(remaining))

    // Update main order list
    const updatedAllOrders = allOrders.map(o => o.id === orderId ? { ...o, status: 'Delivered' } : o)
    localStorage.setItem('orders', JSON.stringify(updatedAllOrders))
    
    loadOrders()
  }

  function getDropOffLocation(code) {
    const loc = DROP_OFFS.find(d => d.code === code)
    return loc ? loc.name : code
  }

  const availableOrders = orders.filter(o => o.status === 'In Progress' && 
    !myOrders.some(mo => mo.id === o.id))
  const activeOrders = myOrders.filter(o => o.dasherStatus === 'accepted')
  const totalDeliveries = deliveryHistory.length

  return (
    <div className="page dasher-dashboard">
      <div className="dashboard-header">
        <h2>Dasher Dashboard</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{activeOrders.length}</div>
            <div className="stat-label">Active Deliveries</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalDeliveries}</div>
            <div className="stat-label">Total Deliveries</div>
          </div>
        </div>
      </div>

      <div className="dasher-name-section">
        <label>
          Your Name (Dasher ID):
          <input 
            value={dasherName} 
            onChange={e => {
              setDasherName(e.target.value)
              localStorage.setItem('dasherName', e.target.value)
            }} 
            placeholder="Enter your dasher name"
          />
        </label>
      </div>

      <div className="dashboard-sections">
        {/* Available Orders */}
        <section className="dashboard-section">
          <h3>Available Orders ({availableOrders.length})</h3>
          {availableOrders.length === 0 ? (
            <p className="empty-state">No available orders</p>
          ) : (
            <div className="order-grid">
              {availableOrders.map(order => (
                <div key={order.id} className="order-card available">
                  <div className="order-header">
                    <span className="order-id">{order.id}</span>
                    <span className="order-time">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="order-customer">
                    <strong>Customer:</strong> {order.name}
                  </div>
                  <div className="order-location">
                    <strong>Deliver to:</strong> {getDropOffLocation(order.drop)}
                  </div>
                  <div className="order-items">
                    <strong>Items:</strong> {order.items.length}
                    <ul>
                      {order.items.slice(0, 3).map(item => (
                        <li key={item.id}>{item.name} x{item.qty}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-value">
                    <strong>Value:</strong> ${order.subtotal.toFixed(2)}
                  </div>
                  <button onClick={() => acceptOrder(order)} className="claim-btn">
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <section className="dashboard-section">
            <h3>My Active Deliveries ({activeOrders.length})</h3>
            <div className="order-grid">
              {activeOrders.map(order => (
                <div key={order.id} className="order-card delivering">
                  <div className="order-header">
                    <span className="order-id">{order.id}</span>
                  </div>
                  <div className="order-customer">
                    <strong>Customer:</strong> {order.name}
                  </div>
                  <div className="order-location">
                    <strong>📍 Deliver to:</strong> {getDropOffLocation(order.drop)}
                  </div>
                  <div className="order-items">
                    <strong>Items:</strong>
                    <ul>
                      {order.items.map(item => (
                        <li key={item.id}>{item.name} x{item.qty}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-value">
                    <strong>Order Value:</strong> ${order.subtotal.toFixed(2)}
                  </div>
                  <button 
                    onClick={() => markAsDelivered(order.id)}
                    className="deliver-btn"
                  >
                    Mark as Delivered
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Delivery History */}
        {deliveryHistory.length > 0 && (
          <section className="dashboard-section">
            <h3>Recent Delivery History</h3>
            <div className="history-list">
              {deliveryHistory.slice(-5).reverse().map(order => (
                <div key={order.id} className="history-item">
                  <div className="history-header">
                    <span className="order-id">{order.id}</span>
                    <span className="order-date">
                      {new Date(order.completedAt || order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-details">
                    <span>Customer: {order.name}</span>
                    <span>Location: {getDropOffLocation(order.drop)}</span>
                    <span>Earnings: +${((order.subtotal * 0.1) + 2).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

