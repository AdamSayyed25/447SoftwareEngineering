import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'

export default function CartPage() {
  const { items, updateQty, remove, subtotal } = useCart()
  const nav = useNavigate()

  function handleQtyChange(itemId, newQty) {
    updateQty(itemId, newQty)
    vibrate(HAPTIC_PATTERNS.LIGHT)
  }

  function handleRemove(itemId) {
    remove(itemId)
    vibrate(HAPTIC_PATTERNS.MEDIUM)
  }

  function handleIncrease(item) {
    handleQtyChange(item.id, item.qty + 1)
  }

  function handleDecrease(item) {
    if (item.qty > 1) {
      handleQtyChange(item.id, item.qty - 1)
    }
  }

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
              <div className="qty-controls">
                <button onClick={() => handleDecrease(it)} disabled={it.qty <= 1}>−</button>
                <span className="qty-display">{it.qty}</span>
                <button onClick={() => handleIncrease(it)}>+</button>
              </div>
              <button onClick={() => handleRemove(it.id)}>Remove</button>
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
