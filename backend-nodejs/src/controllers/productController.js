const Product = require('../models/Product');

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, description, category, price, image_url, is_available } = req.body;

  const product = await Product.create({
    name,
    description,
    category,
    price,
    image_url,
    is_available,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400).json({ detail: 'Invalid product data' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ detail: 'Product not found' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, description, category, price, image_url, is_available } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.image_url = image_url || product.image_url;
    product.is_available = is_available !== undefined ? is_available : product.is_available;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ detail: 'Product not found' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.status(204).json({ message: 'Product removed' });
  } else {
    res.status(404).json({ detail: 'Product not found' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
