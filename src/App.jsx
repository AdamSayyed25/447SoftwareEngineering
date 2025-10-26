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
        </Routes>
      </main>
      <footer className="app-footer">
        UMBC DoorDash - Prototype (no real payments)
      </footer>
    </div>
  )
}
