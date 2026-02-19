const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    totalOrders,
    monthlyOrders,
    totalUsers,
    newUsersThisMonth,
    totalProducts,
    lowStockProducts,
    recentOrders,
    ordersByStatus,
    topProducts
  ] = await Promise.all([
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ 'variants.stock': { $lt: 5 }, isActive: true }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'firstName lastName email'),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Product.find({ isActive: true }).sort('-totalSold').limit(5).populate('category', 'name')
  ]);

  const monthlyRevenueVal = monthlyRevenue[0]?.total || 0;
  const lastMonthRevenueVal = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = lastMonthRevenueVal > 0
    ? Math.round(((monthlyRevenueVal - lastMonthRevenueVal) / lastMonthRevenueVal) * 100)
    : 0;

  res.json({
    success: true,
    stats: {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenueVal,
        growth: revenueGrowth
      },
      orders: {
        total: totalOrders,
        monthly: monthlyOrders,
        byStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
      },
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      recentOrders,
      topProducts
    }
  });
};

// @desc    Get revenue chart data
// @route   GET /api/admin/revenue-chart
// @access  Private/Admin
exports.getRevenueChart = async (req, res) => {
  const { period = 'monthly' } = req.query;
  const today = new Date();

  let groupBy, dateFrom;

  if (period === 'daily') {
    dateFrom = new Date(today.setDate(today.getDate() - 30));
    groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  } else {
    dateFrom = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  }

  const data = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: dateFrom } } },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data });
};
