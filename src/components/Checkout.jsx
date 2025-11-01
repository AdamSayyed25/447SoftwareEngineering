import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { ordersAPI, locationsAPI } from '../services/api'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const [name, setName] = useState('')
  const [dropOffLocations, setDropOffLocations] = useState([])
  const [drop, setDrop] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [tip, setTip] = useState(0)
  const [tipPercent, setTipPercent] = useState(null)
  const nav = useNavigate()

  const tipAmount = tip
  const finalTotal = subtotal + tipAmount

  function handleTipChange(percent) {
    setTipPercent(percent)
    setTip(subtotal * percent / 100)
    vibrate(HAPTIC_PATTERNS.LIGHT)
  }

  function handleCustomTip(value) {
    setTipPercent(null)
    setTip(value)
    vibrate(HAPTIC_PATTERNS.LIGHT)
  }

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
        subtotal: finalTotal,
        tip: tipAmount,
        dropOffLocation: drop,
        recipientName: name
      })
      clear()
      vibrate(HAPTIC_PATTERNS.SUCCESS)
      nav('/confirmation', { state: { order } })
    } catch (err) {
      setError(err.message || 'Failed to place order')
      vibrate(HAPTIC_PATTERNS.ERROR)
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
          
          <div className="tip-section">
            <h5>Add Tip (Optional)</h5>
            <div className="tip-buttons">
              <button 
                type="button" 
                className={tipPercent === 10 ? 'tip-selected' : 'tip-btn'}
                onClick={() => handleTipChange(10)}
              >
                10%
              </button>
              <button 
                type="button" 
                className={tipPercent === 15 ? 'tip-selected' : 'tip-btn'}
                onClick={() => handleTipChange(15)}
              >
                15%
              </button>
              <button 
                type="button" 
                className={tipPercent === 20 ? 'tip-selected' : 'tip-btn'}
                onClick={() => handleTipChange(20)}
              >
                20%
              </button>
            </div>
            <div className="custom-tip">
              <label>Custom:</label>
              <input 
                type="number" 
                step="0.01" 
                value={tip} 
                onChange={e => handleCustomTip(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            {tip > 0 && <div className="tip-added">✓ Tip Added</div>}
          </div>
          
          <div className="order-total">
            <strong>Total: ${finalTotal.toFixed(2)}</strong>
          </div>
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  )
}
