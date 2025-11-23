// Google OAuth helper utilities

// Initialize Google Sign-In
export function initializeGoogleSignIn(clientId, callback, isRegistration = false) {
  if (typeof window.google === 'undefined' || !window.google.accounts) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: callback,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  // Render button
  const buttonId = isRegistration ? 'google-register-btn' : 'google-signin-btn';
  window.google.accounts.id.renderButton(
    document.getElementById(buttonId),
    {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: isRegistration ? 'signup_with' : 'signin_with',
      width: '100%'
    }
  );
}

// Get Google Client ID from environment or use default
export function getGoogleClientId() {
  // In production, you should set this in your .env file as VITE_GOOGLE_CLIENT_ID
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}

