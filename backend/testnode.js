// server.js
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())

const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY') // Replace with your secret key

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // in cents
      currency: 'usd',
      payment_method_types: ['card'],
    })
    console.log('PaymentIntent created:', paymentIntent.id)
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Error creating PaymentIntent:', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(4242, () => console.log('Server running on port 4242'))
