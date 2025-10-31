import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    menu_items: 0,
    today_orders: 0,
    total_revenue: 0
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [menuData, ordersData] = await Promise.all([
        restaurantAPI.getMenu(),
        restaurantAPI.getOrders()
      ]);

      setMenuItems(menuData);
      setOrders(ordersData);
      
      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = ordersData.filter(o => new Date(o.created_at) >= today);
      
      setStats({
        menu_items: menuData.length,
        today_orders: todayOrders.length,
        total_revenue: ordersData.reduce((sum, o) => sum + o.subtotal, 0)
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="page">Loading...</div>;

  const activeOrders = orders.filter(o => o.status !== 'delivered');

  return (
    <div className="page restaurant-dashboard">
      <div className="dashboard-header">
        <h2>Restaurant Dashboard</h2>
        <p className="restaurant-name">Restaurant: {user?.restaurant_location_id || 'N/A'}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Menu Items</h3>
          <p className="stat-number">{stats.menu_items}</p>
        </div>
        <div className="stat-card">
          <h3>Active Orders</h3>
          <p className="stat-number">{activeOrders.length}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Orders</h3>
          <p className="stat-number">{stats.today_orders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">${stats.total_revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Active Orders */}
      <section>
        <h3>Active Orders</h3>
        {activeOrders.length === 0 ? (
          <p>No active orders</p>
        ) : (
          <div className="orders-list">
            {activeOrders.slice(0, 5).map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span className="status-badge">{order.status}</span>
                </div>
                <p><strong>Total:</strong> ${order.subtotal.toFixed(2)}</p>
                <p><strong>Items:</strong> {order.items.length}</p>
                <p className="muted">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <Link to="/restaurant/menu" className="btn-primary">
          Manage Menu →
        </Link>
        <Link to="/restaurant/orders" className="btn-secondary">
          View All Orders →
        </Link>
      </div>
    </div>
  );
}

