import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: function () {
      return this.auth_provider === 'local';
    },
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  password_hash: {
    type: String,
    default: null // Allow null for Google OAuth users
  },
  google_id: {
    type: String,
    default: null,
    sparse: true,
    index: true
  },
  auth_provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'driver', 'restaurant_staff', 'admin'],
    default: 'customer'
  },
  restaurant_location_id: {
    type: String,
    default: null
  },
  favorite_items: [{
    type: String, // MenuItem ID
    ref: 'MenuItem'
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);


