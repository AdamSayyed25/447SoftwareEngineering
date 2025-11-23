import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import App from './App'
import './styles.css'

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </BrowserRouter>
  </React.StrictMode>
)
