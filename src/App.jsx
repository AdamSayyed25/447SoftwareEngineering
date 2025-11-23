import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import MenuPage from './components/MenuPage'
import CartPage from './components/CartPage'
import Checkout from './components/Checkout'
import Confirmation from './components/Confirmation'
import Feedback from './components/Feedback'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import DriverDashboard from './components/DriverDashboard'
import DriverDeliveries from './components/DriverDeliveries'
import DriverStats from './components/DriverStats'
import RestaurantDashboard from './components/RestaurantDashboard'
import RestaurantMenu from './components/RestaurantMenu'
import RestaurantOrders from './components/RestaurantOrders'
import AdminDashboard from './components/AdminDashboard'
import AdminUsers from './components/AdminUsers'
import AdminAnalytics from './components/AdminAnalytics'
import AdminLocations from './components/AdminLocations'
import OrderStatus from './components/OrderStatus'
import OrderHistory from './components/OrderHistory'
import CartProvider from './contexts/CartContext'
import AuthProvider, { useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import { RequireAdmin, RequireDriver, RequireStaff } from './components/RouteGuards'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-root">
      <Header />
      <main>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu/:locationId" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/order/:orderId" element={<OrderStatus />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* Driver Routes */}
          <Route path="/driver" element={<RequireDriver><DriverDashboard /></RequireDriver>} />
          <Route path="/driver/deliveries" element={<RequireDriver><DriverDeliveries /></RequireDriver>} />
          <Route path="/driver/stats" element={<RequireDriver><DriverStats /></RequireDriver>} />

          {/* Restaurant Staff Routes */}
          <Route path="/restaurant" element={<RequireStaff><RestaurantDashboard /></RequireStaff>} />
          <Route path="/restaurant/menu" element={<RequireStaff><RestaurantMenu /></RequireStaff>} />
          <Route path="/restaurant/orders" element={<RequireStaff><RestaurantOrders /></RequireStaff>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
          <Route path="/admin/analytics" element={<RequireAdmin><AdminAnalytics /></RequireAdmin>} />
          <Route path="/admin/locations" element={<RequireAdmin><AdminLocations /></RequireAdmin>} />
        </Routes>
      </main>
      <footer className="app-footer">
        UMBC DoorDash - Prototype (no real payments)
      </footer>
    </div>
  )
}
