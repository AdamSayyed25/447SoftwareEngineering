// Checkout.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { useCart } from '../contexts/CartContext'
import { ordersAPI, locationsAPI, paymentAPI } from '../services/api'
import { vibrate, HAPTIC_PATTERNS } from '../utils/haptic'

const stripePromise = loadStripe('pk_test_51SQaawI7Bdft4DamD9CwKm5z6z0KSRe8UIhJnRneW5VhSaGplVgHy1pIagtqgfRHROfojjtIp6PakMVUk9fQzyRH00rCIxno65')

function CheckoutForm({ clientSecret }) {
  const { items, subtotal, clear } = useCart()
  const [name, setName] = useState('')
  const [dropOffLocations, setDropOffLocations] = useState([])
  const [drop, setDrop] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [tip, setTip] = useState(0)
  const [tipPercent, setTipPercent] = useState(null)
  const [paymentElementReady, setPaymentElementReady] = useState(false)

  const stripe = useStripe()
  const elements = useElements()
  const nav = useNavigate()

  const tipAmount = tip
  const finalTotal = subtotal + tipAmount

  // Tip handlers
  const handleTipChange = (percent) => {
    setTipPercent(percent)
    setTip(subtotal * percent / 100)
    vibrate(HAPTIC_PATTERNS.LIGHT)
  }

  const handleCustomTip = (value) => {
    setTipPercent(null)
    setTip(value)
    vibrate(HAPTIC_PATTERNS.LIGHT)
  }
  useEffect(() => {
    console.log('stripe:', stripe)
    console.log('elements:', elements)
    console.log('paymentElementReady:', paymentElementReady)
  }, [stripe, elements, paymentElementReady])
  // Load drop-off locations
  useEffect(() => {
    async function loadDropOffs() {
      try {
        const data = await locationsAPI.getDropoffs()
        setDropOffLocations(data)
        if (data.length > 0) setDrop(data[0].code)
      } catch (err) {
        console.error('Failed to load drop-offs:', err)
        setError('Failed to load drop-off locations. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    loadDropOffs()
  }, [])

  // Submit payment
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!stripe || !elements || !paymentElementReady) {
      setError('Payment system not ready. Please wait a moment.')
      setSubmitting(false)
      return
    }

    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setSubmitting(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        vibrate(HAPTIC_PATTERNS.ERROR)
        setSubmitting(false)
        return
      }

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        const order = await ordersAPI.create({
          items,
          subtotal: finalTotal,
          tip: tipAmount,
          dropOffLocation: drop,
          recipientName: name,
          paymentIntentId: paymentIntent.id
        })

        clear()
        vibrate(HAPTIC_PATTERNS.SUCCESS)
        nav('/confirmation', { state: { order, paymentIntent } })
      } else {
        setError('Payment was not completed. Please try again.')
        vibrate(HAPTIC_PATTERNS.ERROR)
        setSubmitting(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to place order')
      vibrate(HAPTIC_PATTERNS.ERROR)
      setSubmitting(false)
    }
  }

  if (items.length === 0) return <div className="page"><h2>No items in cart</h2></div>
  if (loading) return <div className="page">Loading checkout...</div>

  return (
    <div className="page">
      <h2>Checkout</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit} className="checkout-form">
        {/* Recipient */}
        <label>
          Recipient Name:
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </label>

        {/* Drop-off */}
        <label>
          Drop-off Location:
          <select value={drop} onChange={e => setDrop(e.target.value)} required>
            {dropOffLocations.map(d => (
              <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
            ))}
          </select>
        </label>

        {/* Order Summary */}
        <div className="order-preview">
          <h4>Order Summary</h4>
          <div>Items: {items.length}</div>
          <div>Subtotal: ${subtotal.toFixed(2)}</div>

          <div className="tip-section">
            <h5>Add Tip (Optional)</h5>
            <div className="tip-buttons">
              {[10, 15, 20].map(p => (
                <button
                  key={p}
                  type="button"
                  className={tipPercent === p ? 'tip-selected' : 'tip-btn'}
                  onClick={() => handleTipChange(p)}
                >
                  {p}%
                </button>
              ))}
            </div>
            <div className="custom-tip">
              <label>Custom:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tip || ''}
                onChange={e => handleCustomTip(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            {tip > 0 && <div className="tip-added">✓ Tip Added: ${tip.toFixed(2)}</div>}
          </div>

          <div className="order-total"><strong>Total: ${finalTotal.toFixed(2)}</strong></div>
        </div>

        {/* Payment */}
        <div className="payment-section">
          <h4>Payment Information</h4>
          <PaymentElement
            options={{ layout: 'tabs' }}
            onReady={() => setPaymentElementReady(true)}
          />
        </div>

        <button type="submit" disabled={submitting || !paymentElementReady} className="submit-button">
          {submitting ? 'Processing Payment...' : `Pay $${finalTotal.toFixed(2)}`}
        </button>
      </form>
    </div>
  )
}

// Wrapper that fetches clientSecret and provides Elements
export default function Checkout() {
  const [clientSecret, setClientSecret] = useState('')
  const { items, subtotal, drop } = useCart() // adjust if needed

  useEffect(() => {
    async function createIntent() {
      if (items.length === 0) return
      try {
        const response = await paymentAPI.createPaymentIntent(subtotal, 'usd', {
          items_count: items.length.toString(),
          drop_off_location: drop || 'TBD'
        })
        setClientSecret(response.clientSecret)
      } catch (err) {
        console.error('Failed to create payment intent:', err)
      }
    }
    createIntent()
  }, [items, subtotal, drop])

  if (!clientSecret) return <div>Loading payment...</div>

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  )
}
