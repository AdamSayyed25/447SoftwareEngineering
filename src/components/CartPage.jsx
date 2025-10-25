import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
  const { items, updateQty, remove, subtotal } = useCart()
  const nav = useNavigate()

  if (items.length === 0)
    return (
      <div className="page">
        <h2>Your cart is empty</h2>
        <p><Link to="/">Browse menus</Link></p>
      </div>
    )

  return (
    <div className="page cart-page">
      <h2>Your Cart</h2>
      <div className="cart-list">
        {items.map(it => (
          <div key={it.id} className="cart-row">
            <div>
              <strong>{it.name}</strong>
              <div className="muted">${it.price.toFixed(2)} each</div>
            </div>
            <div className="cart-controls">
              <input type="number" min="1" value={it.qty}
                onChange={e => updateQty(it.id, Math.max(1, Number(e.target.value)))} />
              <button onClick={() => remove(it.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div>Subtotal: <strong>${subtotal.toFixed(2)}</strong></div>
        <div className="cart-actions">
          <button onClick={() => nav('/checkout')}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  )
}
