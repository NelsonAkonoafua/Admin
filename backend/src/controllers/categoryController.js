const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null })
    .sort('displayOrder')
    .populate({ path: 'subcategories', match: { isActive: true } });
  res.json({ success: true, categories });
};

exports.getCategory = async (req, res) => {
  const query = req.params.identifier.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.identifier }
    : { slug: req.params.identifier };

  const category = await Category.findOne({ ...query, isActive: true })
    .populate({ path: 'subcategories', match: { isActive: true } });

  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};

exports.createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, message: 'Category deleted' });
};
