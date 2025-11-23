import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  location_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'main'
  }
}, {
  timestamps: true
});

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);

