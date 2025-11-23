// DemoCheckout.jsx
import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY') // Replace with your key

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe()
  const elements = useElements()
  const [paymentElementReady, setPaymentElementReady] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !paymentElementReady) {
      setMessage('Stripe not ready')
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required'
      })

      if (error) {
        setMessage(`Payment failed: ${error.message}`)
      } else if (paymentIntent) {
        setMessage(`PaymentIntent status: ${paymentIntent.status}`)
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
  }

  return (
    <form onSubmit={submit}>
      <PaymentElement onReady={() => setPaymentElementReady(true)} />
      <button type="submit" disabled={!paymentElementReady}>Pay</button>
      <p>{message}</p>
    </form>
  )
}

export default function DemoCheckout() {
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    async function createIntent() {
      const res = await fetch('http://localhost:4242/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500 }) // $5
      })
      const data = await res.json()
      console.log('Client secret received:', data.clientSecret)
      setClientSecret(data.clientSecret)
    }
    createIntent()
  }, [])

  if (!clientSecret) return <div>Loading Stripe...</div>

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  )
}
