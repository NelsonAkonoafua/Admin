const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, cartController.getCart);
router.post('/', protect, cartController.addToCart);
router.delete('/', protect, cartController.clearCart);
router.put('/:itemId', protect, cartController.updateCartItem);
router.delete('/:itemId', protect, cartController.removeFromCart);
router.post('/coupon', protect, cartController.applyCoupon);
router.delete('/coupon/remove', protect, cartController.removeCoupon);

module.exports = router;
