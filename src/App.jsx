import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import MenuPage from './components/MenuPage'
import CartPage from './components/CartPage'
import Checkout from './components/Checkout'
import Confirmation from './components/Confirmation'
import Feedback from './components/Feedback'
import Header from './components/Header'
import LoginPage from './components/LoginPage'
import CartProvider from './contexts/CartContext'
import DasherDashboard from './components/DasherDashboard'
import CartProvider, { useCart } from './contexts/CartContext'

function Header() {
  const { items } = useCart()
  const count = items.reduce((s, i) => s + i.qty, 0)
  return (
    <header className="app-header">
      <h1><Link to="/">UMBC DoorDash (Prototype)</Link></h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/cart">Cart ({count})</Link>
        <Link to="/dasher">Dasher Dashboard</Link>
      </nav>
    </header>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <CartProvider>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setIsLoggedIn} />} />
        <Route
          path="/*"
          element={isLoggedIn ? <Layout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </CartProvider>
  )
}

function Layout() {
  return (
    <div className="app-root">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu/:locationId" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} /> 
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/dasher" element={<DasherDashboard />} />
        </Routes>
      </main>
      <footer className="app-footer">
        UMBC DoorDash - Prototype (no real payments)
      </footer>
    </div>
  )
}
