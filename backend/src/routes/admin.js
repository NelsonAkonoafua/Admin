const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/revenue-chart', adminController.getRevenueChart);

module.exports = router;
