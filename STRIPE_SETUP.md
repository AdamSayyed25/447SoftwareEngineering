# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for the UMBC DoorDash application.

## Prerequisites

- Stripe account (test mode for development)
- Stripe API keys (Publishable and Secret keys)

## Step 1: Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create or update the `.env` file in the `backend` directory with your Stripe secret key:
   ```env
   STRIPE_SECRET_KEY=REMOVED_SECRET
   ```

   **Note**: The key provided is for testing/sandbox mode.

## Step 2: Frontend Configuration

1. In the root directory (`447SoftwareEngineering/`), create a `.env` file:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SQaawI7Bdft4DamD9CwKm5z6z0KSRe8UIhJnRneW5VhSaGplVgHy1pIagtqgfRHROfojjtIp6PakMVUk9fQzyRH00rCIxno65
   ```

   **Important**: Vite requires the `VITE_` prefix for environment variables to be accessible in the frontend.

## Step 3: Install Dependencies

The Stripe dependencies are already installed:
- Frontend: `@stripe/stripe-js` and `@stripe/react-stripe-js`
- Backend: `stripe`

If you need to reinstall:
```bash
# Frontend
npm install @stripe/stripe-js @stripe/react-stripe-js

# Backend
cd backend
npm install stripe
```

## Step 4: Start the Servers

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server (in a new terminal):
   ```bash
   npm run dev
   ```

## How It Works

1. **Payment Intent Creation**: When the user is on the checkout page, a payment intent is created on the backend with the order total.

2. **Stripe Elements**: The frontend uses Stripe Elements (PaymentElement) to collect payment information securely.

3. **Payment Confirmation**: When the user submits the form:
   - Stripe confirms the payment
   - If successful, the order is created in the database
   - User is redirected to the confirmation page

## Testing Payments

Since you're in test mode, use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Use any future expiry date, any 3-digit CVC, and any postal code.

## API Endpoints

- `POST /api/payment/create-payment-intent` - Creates a payment intent
  - Body: `{ amount: number, currency: string, metadata: object }`
  - Returns: `{ clientSecret: string, paymentIntentId: string }`

- `POST /api/payment/confirm` - Confirms a payment intent
  - Body: `{ paymentIntentId: string }`
  - Returns: Payment intent status

## Security Notes

- **Never expose your secret key** in the frontend
- The publishable key is safe to use in the frontend
- All payment processing happens securely through Stripe
- Payment information never touches your server (PCI compliant)

## Troubleshooting

### Payment form not loading
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Make sure you've restarted the frontend dev server after adding the env variable

### Payment intent creation fails
- Verify `STRIPE_SECRET_KEY` is set in backend `.env`
- Check that the backend server is running
- Check browser console and server logs for errors

### Payment succeeds but order not created
- Check backend logs for errors
- Verify the orders API endpoint is working
- Check database connection

## Production

When moving to production:

1. Replace test keys with live keys from Stripe Dashboard
2. Set up webhooks for payment confirmation (recommended)
3. Add proper error handling and logging
4. Implement payment retry logic
5. Add fraud detection measures

