const Product = require('../models/Product');
const Category = require('../models/Category');

const getDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const totalCategories = await Category.countDocuments({ isDeleted: false });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalProducts,
      totalCategories,
      activeMenu: 'dashboard'
    });
  } catch (error) {
    req.flash('error', 'Error loading dashboard statistics.');
    res.redirect('/');
  }
};

module.exports = { getDashboard };
