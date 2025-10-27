import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function Header() {
  const { items } = useCart()
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <header className="app-header">
      <h1><Link to="/">UMBC DoorDash (Prototype)</Link></h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/cart">Cart ({count})</Link>
      </nav>
    </header>
  )
}
