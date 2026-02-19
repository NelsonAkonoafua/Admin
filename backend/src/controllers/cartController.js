const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name images price isActive variants');

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Remove items with inactive products
  cart.items = cart.items.filter(item => item.product && item.product.isActive);
  await cart.save();

  res.json({ success: true, cart });
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  const { productId, variantId, quantity = 1, size, color } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    return res.status(404).json({ success: false, message: 'Product variant not found' });
  }

  if (variant.stock < quantity) {
    return res.status(400).json({ success: false, message: `Only ${variant.stock} items available` });
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Check if same variant already in cart
  const existingItem = cart.items.find(
    item => item.product.toString() === productId && item.variantId.toString() === variantId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > variant.stock) {
      return res.status(400).json({ success: false, message: `Only ${variant.stock} items available` });
    }
    existingItem.quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      variantId,
      quantity,
      size,
      color,
      price: product.price,
      name: product.name,
      image: product.images[0]?.url || ''
    });
  }

  await cart.save();

  const populated = await cart.populate('items.product', 'name images price isActive variants');
  res.json({ success: true, cart: populated });
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Cart item not found' });
  }

  // Verify stock
  const product = await Product.findById(item.product);
  const variant = product?.variants.id(item.variantId);
  if (variant && quantity > variant.stock) {
    return res.status(400).json({ success: false, message: `Only ${variant.stock} items available` });
  }

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const populated = await cart.populate('items.product', 'name images price isActive variants');
  res.json({ success: true, cart: populated });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Cart item not found' });
  }

  item.deleteOne();
  await cart.save();

  const populated = await cart.populate('items.product', 'name images price isActive variants');
  res.json({ success: true, cart: populated });
};

// @desc    Apply coupon code
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const validity = coupon.isValid(cart.subtotal);
  if (!validity.valid) {
    return res.status(400).json({ success: false, message: validity.message });
  }

  cart.couponCode = coupon.code;
  cart.discount = coupon.discountValue;
  cart.discountType = coupon.discountType;
  await cart.save();

  const populated = await cart.populate('items.product', 'name images price isActive variants');
  res.json({
    success: true,
    cart: populated,
    discountAmount: coupon.calculateDiscount(cart.subtotal)
  });
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  cart.couponCode = null;
  cart.discount = 0;
  await cart.save();

  const populated = await cart.populate('items.product', 'name images price isActive variants');
  res.json({ success: true, cart: populated });
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = [];
    cart.couponCode = null;
    cart.discount = 0;
    await cart.save();
  }

  res.json({ success: true, message: 'Cart cleared' });
};
