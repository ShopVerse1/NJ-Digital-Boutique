const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Newsletter', newsletterSchema);