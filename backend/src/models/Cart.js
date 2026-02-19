const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true }, // Price at time of adding to cart
  name: { type: String, required: true },
  image: { type: String }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  couponCode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for discount amount
cartSchema.virtual('discountAmount').get(function() {
  const subtotal = this.subtotal;
  if (this.discountType === 'percentage') {
    return Math.round((subtotal * this.discount / 100) * 100) / 100;
  }
  return Math.min(this.discount, subtotal);
});

// Virtual for total
cartSchema.virtual('total').get(function() {
  return Math.round((this.subtotal - this.discountAmount) * 100) / 100;
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
