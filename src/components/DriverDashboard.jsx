import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driverAPI } from '../services/api';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_deliveries: 0,
    pending_accept: 0
  });

  useEffect(() => {
    loadAvailableOrders();
    loadStats();
    const interval = setInterval(() => {
      loadAvailableOrders();
      loadStats();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  async function loadAvailableOrders() {
    try {
      const data = await driverAPI.getAvailableOrders();
      setAvailableOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load available orders');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await driverAPI.getMyDeliveries();
      const deliveredCount = (data?.completed || []).length;
      const pending = availableOrders.length;
      setStats({
        total_deliveries: deliveredCount,
        pending_accept: pending
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function acceptOrder(orderId) {
    try {
      await driverAPI.acceptOrder(orderId);
      await loadAvailableOrders();
      await loadStats();
      // Navigate to My Deliveries so driver sees it immediately
      navigate('/driver/deliveries');
    } catch (err) {
      console.error('Failed to accept order:', err);
      alert('Failed to accept order');
    }
  }

  async function declineOrder(orderId) {
    try {
      await driverAPI.declineOrder(orderId);
      await loadAvailableOrders();
      await loadStats();
    } catch (err) {
      console.error('Failed to decline order:', err);
      alert('Failed to decline order');
    }
  }

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page driver-dashboard">
      <h2>Driver Dashboard</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Available Orders</h3>
          <p className="stat-number">{stats.pending_accept}</p>
        </div>
        <div className="stat-card">
          <h3>Total Deliveries</h3>
          <p className="stat-number">{stats.total_deliveries}</p>
        </div>
      </div>

      {/* Available Orders */}
      <section>
        <h3>Available Orders for Pickup</h3>
        {error && <p className="error">{error}</p>}

        {availableOrders.length === 0 ? (
          <p>No orders available at this time.</p>
        ) : (
          <div className="orders-list">
            {availableOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span className="status-badge">{order.status}</span>
                </div>

                <div className="order-info">
                  {/* Customer info (when available) */}
                  {order.recipient_name && (
                    <p><strong>Customer:</strong> {order.recipient_name}</p>
                  )}
                  <p><strong>Drop-off:</strong> {order.drop_off_location}</p>
                  <p><strong>Total:</strong> ${order.subtotal.toFixed(2)}</p>
                  <p><strong>Items:</strong> {order.items.length}</p>
                  <p className="muted">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => acceptOrder(order.id)}
                  className="accept-btn"
                >
                  Accept Order
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="driver-actions">
        <Link to="/driver/deliveries" className="btn-secondary">
          View My Deliveries →
        </Link>
      </div>
    </div>
  );
}

