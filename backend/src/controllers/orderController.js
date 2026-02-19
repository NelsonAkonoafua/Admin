const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendEmail = require('../utils/email');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, paymentResult, stripePaymentIntentId } = req.body;

  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name price images variants isActive');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  // Validate stock and build order items
  const orderItems = [];
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product "${item.name}" is no longer available`
      });
    }

    const variant = item.product.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${item.name}" (${item.size}, ${item.color})`
      });
    }

    orderItems.push({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.product.price,
      sku: variant.sku
    });
  }

  // Calculate totals
  const subtotal = cart.subtotal;
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const taxRate = 0.08; // 8% tax
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const discountAmount = cart.discountAmount;
  const total = Math.round((subtotal + shippingCost + tax - discountAmount) * 100) / 100;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentResult,
    stripePaymentIntentId,
    subtotal,
    shippingCost,
    tax,
    discount: discountAmount,
    couponCode: cart.couponCode,
    total,
    isPaid: !!paymentResult || !!stripePaymentIntentId,
    paidAt: (paymentResult || stripePaymentIntentId) ? new Date() : null,
    status: (paymentResult || stripePaymentIntentId) ? 'confirmed' : 'pending',
    statusHistory: [{ status: 'pending', note: 'Order placed' }]
  });

  // Update stock and sales count
  for (const item of cart.items) {
    await Product.findOneAndUpdate(
      { _id: item.product._id, 'variants._id': item.variantId },
      {
        $inc: {
          'variants.$.stock': -item.quantity,
          totalSold: item.quantity
        }
      }
    );
  }

  // Clear cart
  cart.items = [];
  cart.couponCode = null;
  cart.discount = 0;
  await cart.save();

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `forAbby - Order Confirmation #${order.orderNumber}`,
      template: 'orderConfirmation',
      data: {
        name: req.user.firstName,
        orderNumber: order.orderNumber,
        items: order.items,
        total: order.total
      }
    });
  } catch (err) {
    console.error('Order email error:', err.message);
  }

  const populated = await order.populate('items.product', 'name images slug');
  res.status(201).json({ success: true, order: populated });
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  const { page = 1, limit = 20, status, sort = '-createdAt' } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  res.json({ success: true, orders, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('items.product', 'name images slug');

  res.json({ success: true, orders });
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name images slug');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Ensure user can only access their own orders (unless admin)
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }

  res.json({ success: true, order });
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  const { status, note, trackingNumber, shippingCarrier } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  order.statusHistory.push({ status, note });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (shippingCarrier) order.shippingCarrier = shippingCarrier;
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();
  res.json({ success: true, order });
};
