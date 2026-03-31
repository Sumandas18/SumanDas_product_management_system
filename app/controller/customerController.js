const Product = require('../models/Product');
const Category = require('../models/Category');

const getHome = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { isDeleted: false };
    
    // Filtering by category ID or slug if available
    if (category) {
      filter.category = category;
    }

    // Searching by keyword in Name or Description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).populate('category', 'name').sort({ createdAt: -1 });
    const categories = await Category.find({ isDeleted: false });

    res.render('customer/home', { 
      title: 'Shop | Product Portal', 
      products, 
      categories, 
      searchQuery: search || '',
      selectedCategory: category || ''
    });
  } catch (error) {
    req.flash('error', 'Error loading products');
    res.redirect('/');
  }
};

const getProductDetail = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let product;

    
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findOne({ _id: identifier, isDeleted: false }).populate('category', 'name');
    }
    
    // Fallback to searching by slug
    if (!product) {
      product = await Product.findOne({ slug: identifier, isDeleted: false }).populate('category', 'name');
    }

    if (!product) {
      res.status(404).render('404', { title: 'Product Not Found' });
      return;
    }

    res.render('customer/productDetail', { 
      title: product.name, 
      product 
    });
  } catch (err) {
    req.flash('error', 'Product not found');
    res.redirect('/');
  }
};

module.exports = {
  getHome,
  getProductDetail
};
