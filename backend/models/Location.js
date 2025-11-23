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
  }
}, {
  timestamps: true
});

export const Location = mongoose.model('Location', locationSchema);

