const Product = require('../models/Product');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  const {
    category, size, color, minPrice, maxPrice,
    sort, search, page = 1, limit = 12,
    featured, newArrival, bestSeller, tag
  } = req.query;

  const query = { isActive: true };

  // Filtering
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (newArrival === 'true') query.isNewArrival = true;
  if (bestSeller === 'true') query.isBestSeller = true;
  if (tag) query.tags = { $in: [tag.toLowerCase()] };

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Size filter (on variants)
  if (size) {
    query['variants.size'] = size;
    query['variants.stock'] = { $gt: 0 };
  }

  // Color filter (on variants)
  if (color) {
    query['variants.color'] = { $regex: color, $options: 'i' };
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'price-asc') sortOption = { price: 1 };
  else if (sort === 'price-desc') sortOption = { price: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'popular') sortOption = { totalSold: -1 };
  else if (sort === 'rating') sortOption = { averageRating: -1 };

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .select('-__v')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    products
  });
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/:identifier
// @access  Public
exports.getProduct = async (req, res) => {
  const { identifier } = req.params;

  const query = identifier.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: identifier }
    : { slug: identifier };

  const product = await Product.findOne({ ...query, isActive: true })
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      match: { isApproved: true },
      populate: { path: 'user', select: 'firstName lastName avatar' }
    });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  const populated = await product.populate('category', 'name slug');
  res.status(201).json({ success: true, product: populated });
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category', 'name slug');

  res.json({ success: true, product });
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product deleted successfully' });
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8);

  res.json({ success: true, products });
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true
  })
    .populate('category', 'name slug')
    .limit(4);

  res.json({ success: true, products: related });
};
