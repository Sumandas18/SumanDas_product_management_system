const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const { productSchema } = require('../utils/productValidation');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.render('admin/products/index', { title: 'Manage Products', products, activeMenu: 'products' });
  } catch (error) {
    req.flash('error', 'Failed to fetch products');
    res.redirect('/admin');
  }
};

const getAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.render('admin/products/form', { 
      title: 'Add Product', 
      product: null, 
      categories,
      errors: [], 
      oldInput: {},
      activeMenu: 'products'
    });
  } catch (err) {
    req.flash('error', 'Failed to load categories');
    res.redirect('/admin/products');
  }
};

const postAddProduct = async (req, res) => {
  const { name, category, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const { error } = productSchema.validate({ name, category, description }, { abortEarly: false });

  if (error) {
    if (req.file) {
      // Remove uploaded file if validation fails
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }

    const categories = await Category.find({ isDeleted: false });
    const errors = error.details.map((err) => err.message);
    
    return res.render('admin/products/form', {
      title: 'Add Product',
      product: null,
      categories,
      errors,
      oldInput: { name, category, description },
      activeMenu: 'products'
    });
  }

  try {
    await Product.create({ name, category, description, image });
    req.flash('success', 'Product added successfully');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Something went wrong while saving the product');
    res.redirect('/admin/products');
  }
};

const getEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }
    const categories = await Category.find({ isDeleted: false });
    
    res.render('admin/products/form', { 
      title: 'Edit Product', 
      product, 
      categories,
      errors: [], 
      oldInput: {},
      activeMenu: 'products'
    });
  } catch (error) {
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/products');
  }
};

const postEditProduct = async (req, res) => {
  const { name, category, description } = req.body;
  const { id } = req.params;
  
  const { error } = productSchema.validate({ name, category, description }, { abortEarly: false });

  if (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    }
    const categories = await Category.find({ isDeleted: false });
    const errors = error.details.map((err) => err.message);
    return res.render('admin/products/form', {
      title: 'Edit Product',
      product: { _id: id, image: req.body.oldImage },
      categories,
      errors,
      oldInput: { name, category, description },
      activeMenu: 'products'
    });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    product.name = name;
    product.category = category;
    product.description = description;

 
    if (req.file) {
    
      if (product.image) {
        const oldImagePath = path.join(__dirname, '../../', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    req.flash('success', 'Product updated successfully');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/products');
  }
};

const postDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }

    product.isDeleted = true;

    
    if (product.image) {
      const imgPath = path.join(__dirname, '../../', product.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
      product.image = null;
    }

    await product.save();

    req.flash('success', 'Product deleted successfully');
    res.redirect('/admin/products');
  } catch (error) {
    req.flash('error', 'Failed to delete product');
    res.redirect('/admin/products');
  }
};

module.exports = {
  getProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct
};
