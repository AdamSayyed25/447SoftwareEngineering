import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  items: {
    type: [{
      id: String,
      name: String,
      price: Number,
      qty: Number
    }],
    required: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tip: {
    type: Number,
    default: 0,
    min: 0
  },
  drop_off_location: {
    type: String,
    required: true
  },
  recipient_name: {
    type: String,
    default: null
  },
  driver_id: {
    type: String,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  payment_intent_id: {
    type: String,
    default: null,
    index: true
  },
  payment_method_details: {
    brand: String,
    last4: String
  },
  prepared_at: Date,
  picked_up_at: Date,
  delivered_at: Date,
  cancelled_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update updated_at before saving
orderSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);

