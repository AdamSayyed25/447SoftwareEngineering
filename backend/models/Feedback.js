import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  order_id: {
    type: String,
    default: null,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);

