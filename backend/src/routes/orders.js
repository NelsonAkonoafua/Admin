const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my-orders', protect, orderController.getMyOrders);
router.post('/', protect, orderController.createOrder);
router.get('/:id', protect, orderController.getOrder);

// Admin routes
router.get('/', protect, authorize('admin'), orderController.getOrders);
router.put('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
