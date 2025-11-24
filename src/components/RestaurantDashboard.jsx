import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RestaurantMenu from './RestaurantMenu';
import RestaurantOrders from './RestaurantOrders';
import RestaurantSettings from './RestaurantSettings';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total_orders: 0,
    today_orders: 0,
    total_revenue: 0,
    today_revenue: 0
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      loadStats();
    }
  }, [activeTab]);

  async function loadStats() {
    try {
      const data = await restaurantAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  return (
    <div className="page restaurant-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Restaurant Dashboard</h2>
          <p className="restaurant-name">Location: {user?.restaurant_location_id || 'Unassigned'}</p>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Today's Orders</h3>
                <p className="stat-number">{stats.today_orders}</p>
              </div>
              <div className="stat-card">
                <h3>Today's Revenue</h3>
                <p className="stat-number">${stats.today_revenue.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">{stats.total_orders}</p>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-number">${stats.total_revenue.toFixed(2)}</p>
              </div>
            </div>

            <div className="quick-actions" style={{ marginTop: 30 }}>
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', gap: 15 }}>
                <button className="btn-primary" onClick={() => setActiveTab('orders')}>View Active Orders</button>
                <button className="btn-secondary" onClick={() => setActiveTab('menu')}>Update Menu</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && <RestaurantOrders />}
        {activeTab === 'menu' && <RestaurantMenu />}
        {activeTab === 'settings' && <RestaurantSettings />}
      </div>
    </div>
  );
}

