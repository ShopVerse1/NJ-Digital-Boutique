const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Product description is required'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: { 
    type: String, 
    required: [true, 'Product category is required'],
    enum: ['Fashion', 'Digital Products']
  },
  subcategory: {
    type: String,
    trim: true
  },
  image: { 
    type: String, 
    required: [true, 'Product image is required'] 
  },
  images: [{
    type: String
  }],
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  badge: {
    type: String,
    enum: ['Bestseller', 'New', 'Popular', 'Sale', 'None'],
    default: 'None'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);