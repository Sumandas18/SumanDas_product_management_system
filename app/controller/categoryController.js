const Category = require('../models/Category');
const { categorySchema } = require('../utils/categoryValidation');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.render('admin/categories/index', { title: 'Manage Categories', categories, activeMenu: 'categories' });
  } catch (error) {
    req.flash('error', 'Failed to fetch categories');
    res.redirect('/admin');
  }
};

const getAddCategory = (req, res) => {
  res.render('admin/categories/form', { 
    title: 'Add Category', 
    category: null, 
    errors: [], 
    oldInput: {},
    activeMenu: 'categories'
  });
};

const postAddCategory = async (req, res) => {
  const { name } = req.body;
  const { error } = categorySchema.validate({ name }, { abortEarly: false });

  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.render('admin/categories/form', {
      title: 'Add Category',
      category: null,
      errors,
      oldInput: { name },
      activeMenu: 'categories'
    });
  }

  try {
    const existing = await Category.findOne({ name: name.trim() });
    if (existing && !existing.isDeleted) {
      return res.render('admin/categories/form', {
        title: 'Add Category',
        category: null,
        errors: ['Category already exists'],
        oldInput: { name },
        activeMenu: 'categories'
      });
    }

    await Category.create({ name });
    req.flash('success', 'Category added successfully');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Add Category Error:', err);
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/categories');
  }
};

const getEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }
    res.render('admin/categories/form', { 
      title: 'Edit Category', 
      category, 
      errors: [], 
      oldInput: {},
      activeMenu: 'categories'
    });
  } catch (error) {
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/categories');
  }
};

const postEditCategory = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  
  const { error } = categorySchema.validate({ name }, { abortEarly: false });

  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.render('admin/categories/form', {
      title: 'Edit Category',
      category: { _id: id },
      errors,
      oldInput: { name },
      activeMenu: 'categories'
    });
  }

  try {
    const category = await Category.findById(id);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    category.name = name;
    await category.save();

    req.flash('success', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (err) {
    if (err.code === 11000) {
      return res.render('admin/categories/form', {
        title: 'Edit Category',
        category: { _id: id },
        errors: ['Category with this name already exists'],
        oldInput: { name },
        activeMenu: 'categories'
      });
    }
    req.flash('error', 'Something went wrong');
    res.redirect('/admin/categories');
  }
};

const postDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    category.isDeleted = true;
    await category.save();

    req.flash('success', 'Category deleted successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    req.flash('error', 'Failed to delete category');
    res.redirect('/admin/categories');
  }
};

module.exports = {
  getCategories,
  getAddCategory,
  postAddCategory,
  getEditCategory,
  postEditCategory,
  postDeleteCategory
};
