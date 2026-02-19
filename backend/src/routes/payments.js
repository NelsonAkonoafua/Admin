const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook must come before body parsing middleware
router.post('/webhook', paymentController.stripeWebhook);
router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);
router.post('/create-checkout-session', protect, paymentController.createCheckoutSession);
router.post('/confirm', protect, paymentController.confirmPayment);

module.exports = router;
