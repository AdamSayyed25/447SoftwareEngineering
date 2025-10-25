import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { DROP_OFFS } from '../data/mockData'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const [name, setName] = useState('')
  const [drop, setDrop] = useState(DROP_OFFS[0].code)
  const nav = useNavigate()

  function submit(e) {
    e.preventDefault()
    const order = {
      id: 'ORD-' + Date.now(),
      name,
      drop,
      items,
      subtotal,
      status: 'In Progress',
      createdAt: new Date().toISOString()
    }
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(order)
    localStorage.setItem('orders', JSON.stringify(orders))

    clear()
    nav('/confirmation', { state: { order } })
  }

  if (items.length === 0)
    return <div className="page"><h2>No items in cart</h2></div>

  return (
    <div className="page">
      <h2>Checkout (Simulated)</h2>
      <form onSubmit={submit} className="checkout-form">
        <label>
          Recipient Name (demo):
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Drop-off Location:
          <select value={drop} onChange={e => setDrop(e.target.value)}>
            {DROP_OFFS.map(d => (
              <option key={d.code} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </label>
        <div className="order-preview">
          <h4>Order Summary</h4>
          <div>Items: {items.length}</div>
          <div>Subtotal: ${subtotal.toFixed(2)}</div>
        </div>
        <button type="submit">Place Simulated Order</button>
      </form>
    </div>
  )
}
