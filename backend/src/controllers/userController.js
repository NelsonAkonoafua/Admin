const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name price images slug averageRating');
  res.json({ success: true, user });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, phone, avatar },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user });
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses');
  res.json({ success: true, addresses: user.addresses });
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (req.body.isDefault) {
    // Remove default from all other addresses
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }

  // If first address, make it default
  if (user.addresses.length === 0) req.body.isDefault = true;

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  if (req.body.isDefault) {
    user.addresses.forEach(addr => { addr.isDefault = false; });
  }

  Object.assign(address, req.body);
  await user.save();

  res.json({ success: true, addresses: user.addresses });
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  address.deleteOne();
  await user.save();

  res.json({ success: true, addresses: user.addresses });
};

// @desc    Toggle wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user.id);
  const productId = req.params.productId;

  const index = user.wishlist.indexOf(productId);
  if (index > -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  const populated = await user.populate('wishlist', 'name price images slug');
  res.json({ success: true, wishlist: populated.wishlist, inWishlist: index === -1 });
};

// Admin controllers
// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query)
  ]);

  res.json({ success: true, users, total, totalPages: Math.ceil(total / limit) });
};

// @desc    Get user by ID (admin)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isActive },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};
