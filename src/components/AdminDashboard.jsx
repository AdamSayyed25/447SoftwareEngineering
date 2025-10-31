import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) return <div className="page">Loading...</div>;

  return (
    <div className="page admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>System Overview and Statistics</p>
      </div>

      {/* System Stats */}
      <section className="stats-section">
        <h3>System Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Orders</h4>
            <p className="stat-number">{stats.orders.total}</p>
            <div className="stat-details">
              <span>Pending: {stats.orders.pending}</span>
              <span>Delivered: {stats.orders.delivered}</span>
            </div>
          </div>

          <div className="stat-card">
            <h4>Users</h4>
            <p className="stat-number">{stats.users.total}</p>
            <div className="stat-details">
              <span>Customers: {stats.users.customers}</span>
              <span>Drivers: {stats.users.drivers}</span>
              <span>Staff: {stats.users.staff}</span>
            </div>
          </div>

          <div className="stat-card">
            <h4>Feedback</h4>
            <p className="stat-number">{stats.feedback.total}</p>
            <div className="stat-details">
              <span>Avg Rating: {stats.feedback.average_rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="stat-card">
            <h4>Revenue</h4>
            <p className="stat-number">${stats.revenue.total.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Order Status Breakdown */}
      <section>
        <h3>Order Status</h3>
        <div className="order-status-breakdown">
          <div className="status-item">
            <span className="status-label">Pending:</span>
            <span className="status-value">{stats.orders.pending}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Preparing:</span>
            <span className="status-value">{stats.orders.preparing}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Out for Delivery:</span>
            <span className="status-value">{stats.orders.out_for_delivery}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Delivered:</span>
            <span className="status-value">{stats.orders.delivered}</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <Link to="/admin/users" className="btn-primary">
          Manage Users →
        </Link>
        <Link to="/admin/analytics" className="btn-secondary">
          View Analytics →
        </Link>
        <Link to="/admin/locations" className="btn-secondary">
          Manage Locations →
        </Link>
      </div>
    </div>
  );
}

