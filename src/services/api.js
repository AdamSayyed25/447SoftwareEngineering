const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get stored auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Generic API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication
export const authAPI = {
  register: async (email, username, password) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password })
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  login: async (username, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  verify: async () => {
    return apiRequest('/auth/verify');
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Google OAuth methods
  googleRegister: async (credential) => {
    const data = await apiRequest('/auth/google/register', {
      method: 'POST',
      body: JSON.stringify({ credential })
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  googleLogin: async (credential) => {
    const data = await apiRequest('/auth/google/login', {
      method: 'POST',
      body: JSON.stringify({ credential })
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  }
};

// Locations
export const locationsAPI = {
  getAll: () => apiRequest('/locations'),
  
  getById: (id) => apiRequest(`/locations/${id}`),
  
  getDropoffs: () => apiRequest('/locations/dropoffs/all')
};

// Menu
export const menuAPI = {
  getByLocation: (locationId) => apiRequest(`/menu/${locationId}`),
  
  getAll: () => apiRequest('/menu')
};

// Orders
export const ordersAPI = {
  create: (order) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  }),

  getById: (orderId) => apiRequest(`/orders/${orderId}`),

  getAll: () => apiRequest('/orders'),

  updateStatus: (orderId, status) => apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

// Feedback
export const feedbackAPI = {
  submit: (feedback) => apiRequest('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedback)
  }),

  getAll: () => apiRequest('/feedback'),

  getByOrderId: (orderId) => apiRequest(`/feedback/${orderId}`)
};

// Driver API
export const driverAPI = {
  getAvailableOrders: () => apiRequest('/driver/orders'),

  acceptOrder: (orderId) => apiRequest(`/driver/orders/${orderId}/accept`, {
    method: 'POST'
  }),

  declineOrder: (orderId) => apiRequest(`/driver/orders/${orderId}/decline`, {
    method: 'POST'
  }),

  deliverOrder: (orderId) => apiRequest(`/driver/orders/${orderId}/deliver`, {
    method: 'POST'
  }),

  getMyDeliveries: () => apiRequest('/driver/my-deliveries'),

  getStats: () => apiRequest('/driver/stats')
};

// Restaurant API
export const restaurantAPI = {
  getMenu: () => apiRequest('/restaurant/menu'),
  
  addMenuItem: (item) => apiRequest('/restaurant/menu', {
    method: 'POST',
    body: JSON.stringify(item)
  }),

  updateMenuItem: (itemId, item) => apiRequest(`/restaurant/menu/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  }),

  deleteMenuItem: (itemId) => apiRequest(`/restaurant/menu/${itemId}`, {
    method: 'DELETE'
  }),

  getOrders: () => apiRequest('/restaurant/orders')
};

// Admin API
export const adminAPI = {
  getStats: () => apiRequest('/admin/stats'),

  getUsers: () => apiRequest('/admin/users'),

  createUser: (user) => apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(user)
  }),

  getFeedback: () => apiRequest('/admin/feedback'),

  getLocations: () => apiRequest('/admin/locations')
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (amount, currency = 'usd', metadata = {}) => 
    apiRequest('/payment/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, metadata })
    }),

  confirmPayment: (paymentIntentId) =>
    apiRequest('/payment/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId })
    })
};

