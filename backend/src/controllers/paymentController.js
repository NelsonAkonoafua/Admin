const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd', orderId } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency,
    metadata: {
      orderId: orderId || '',
      userId: req.user.id
    },
    automatic_payment_methods: { enabled: true }
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  });
};

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product', 'name images price');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const lineItems = cart.items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${item.name} (${item.size}, ${item.color})`,
        images: item.image ? [item.image] : []
      },
      unit_amount: Math.round(item.price * 100)
    },
    quantity: item.quantity
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    customer_email: req.user.email,
    metadata: {
      userId: req.user.id,
      couponCode: cart.couponCode || ''
    },
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU']
    },
    discounts: cart.couponCode ? [] : undefined
  });

  res.json({ success: true, sessionId: session.id, url: session.url });
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      if (paymentIntent.metadata.orderId) {
        await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
          isPaid: true,
          paidAt: new Date(),
          status: 'confirmed',
          'paymentResult.id': paymentIntent.id,
          'paymentResult.status': paymentIntent.status,
          'paymentResult.updateTime': new Date().toISOString()
        });
      }
      break;
    }
    case 'checkout.session.completed': {
      const session = event.data.object;
      // Handle successful checkout session
      await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        {
          isPaid: true,
          paidAt: new Date(),
          status: 'confirmed'
        }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object;
      if (failedIntent.metadata.orderId) {
        await Order.findByIdAndUpdate(failedIntent.metadata.orderId, {
          status: 'cancelled'
        });
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Confirm payment and update order
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  const { paymentIntentId, orderId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return res.status(400).json({ success: false, message: 'Payment not completed' });
  }

  const order = await Order.findByIdAndUpdate(orderId, {
    isPaid: true,
    paidAt: new Date(),
    status: 'confirmed',
    'paymentResult.id': paymentIntent.id,
    'paymentResult.status': paymentIntent.status,
    'paymentResult.updateTime': new Date().toISOString(),
    stripePaymentIntentId: paymentIntentId
  }, { new: true });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, order });
};
