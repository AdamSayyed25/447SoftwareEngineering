# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the UMBC DoorDash application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to Google Cloud Console

## Step 1: Create a Google OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information (App name, User support email, etc.)
   - Add your email as a test user (for testing)
   - Save and continue

6. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: UMBC DoorDash (or your preferred name)
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for local development)
     - `http://localhost:3000` (if using different port)
     - Add your production URL when deploying
   - **Authorized redirect URIs**: Leave empty (we're using ID tokens, not redirects)
   - Click **Create**

7. Copy the **Client ID** (you'll need this)

## Step 2: Configure Backend

Add the Google Client ID to your backend `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Location**: `447SoftwareEngineering/backend/.env`

## Step 3: Configure Frontend

Create a `.env` file in the frontend root directory (`447SoftwareEngineering/`):

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Note**: Vite requires the `VITE_` prefix for environment variables to be accessible in the frontend.

## Step 4: Restart Servers

After adding the environment variables:

1. Restart the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Restart the frontend dev server:
   ```bash
   npm run dev
   ```

## How It Works

### Registration Flow (Create Account Page)
- User clicks "Sign in with Google"
- Google authentication popup appears
- User selects Google account
- If email doesn't exist in database → Creates new account
- If email already exists → Shows error "Account already exists. Please sign in instead."

### Login Flow (Sign In Page)
- User clicks "Sign in with Google"
- Google authentication popup appears
- User selects Google account
- If email exists in database → Logs in successfully
- If email doesn't exist → Shows error "Account not found. Please create an account first."

## Features

- ✅ Google OAuth 2.0 authentication
- ✅ Automatic account creation on registration page
- ✅ Account verification on login page
- ✅ Username auto-generation from email (if conflicts, adds random number)
- ✅ Seamless integration with existing authentication system
- ✅ JWT token generation for authenticated users

## Troubleshooting

### Google Sign-In button doesn't appear
- Check that `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Check browser console for errors
- Verify Google Identity Services script is loaded (check Network tab)

### "Invalid Google token" error
- Verify `GOOGLE_CLIENT_ID` in backend `.env` matches frontend `VITE_GOOGLE_CLIENT_ID`
- Check that authorized JavaScript origins include your current URL

### CORS errors
- Ensure backend CORS is configured to allow requests from frontend origin
- Check `FRONTEND_URL` in backend `.env`

## Security Notes

- Never commit `.env` files to version control
- Use different Client IDs for development and production
- Keep your Client ID secret (though it's exposed in frontend, it's still good practice)
- Regularly rotate OAuth credentials if compromised

