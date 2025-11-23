import mongoose from 'mongoose';

const dropOffLocationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const DropOffLocation = mongoose.model('DropOffLocation', dropOffLocationSchema);

