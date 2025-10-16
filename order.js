const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  image: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAmount: {
    type: Number,
    default: 5.00,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    phone: String
  },
  payment: {
    method: {
      type: String,
      enum: ['razorpay', 'cod', 'card', 'upi'],
      default: 'razorpay'
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'NJ' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  // Update status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      note: `Order status changed to ${this.status}`
    });
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);