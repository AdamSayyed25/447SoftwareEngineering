import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  hours: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Dining'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  contact_email: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

export const Location = mongoose.model('Location', locationSchema);

