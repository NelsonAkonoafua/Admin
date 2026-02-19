const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ product: req.params.productId, isApproved: true })
  ]);

  res.json({ success: true, reviews, total, totalPages: Math.ceil(total / limit) });
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  const { productId, rating, title, comment } = req.body;

  // Check if already reviewed
  const existing = await Review.findOne({ product: productId, user: req.user.id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
  }

  // Check if verified purchase
  const order = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    isPaid: true
  });

  const review = await Review.create({
    product: productId,
    user: req.user.id,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!order
  });

  const populated = await review.populate('user', 'firstName lastName avatar');
  res.status(201).json({ success: true, review: populated });
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  if (review.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('user', 'firstName lastName avatar');

  res.json({ success: true, review });
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
  }

  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
};
