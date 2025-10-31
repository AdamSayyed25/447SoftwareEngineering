import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { ordersAPI, locationsAPI } from '../services/api'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const [name, setName] = useState('')
  const [dropOffLocations, setDropOffLocations] = useState([])
  const [drop, setDrop] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    loadDropOffs()
  }, [])

  async function loadDropOffs() {
    try {
      const data = await locationsAPI.getDropoffs()
      setDropOffLocations(data)
      if (data.length > 0) {
        setDrop(data[0].code)
      }
    } catch (err) {
      console.error('Failed to load drop-off locations:', err)
    } finally {
      setLoading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const order = await ordersAPI.create({
        items,
        subtotal,
        dropOffLocation: drop
      })
      clear()
      nav('/confirmation', { state: { order } })
    } catch (err) {
      setError(err.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0)
    return <div className="page"><h2>No items in cart</h2></div>

  if (loading) return <div className="page">Loading checkout...</div>

  return (
    <div className="page">
      <h2>Checkout (Simulated)</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit} className="checkout-form">
        <label>
          Recipient Name (demo):
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Drop-off Location:
          <select value={drop} onChange={e => setDrop(e.target.value)}>
            {dropOffLocations.map(d => (
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Placing Order...' : 'Place Simulated Order'}
        </button>
      </form>
    </div>
  )
}
