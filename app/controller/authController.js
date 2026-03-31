const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../utils/authValidation');


const getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', errors: [], oldInput: {} });
};

const postRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Joi validation
  const { error } = registerSchema.validate(
    { name, email, password, confirmPassword },
    { abortEarly: false }
  );

  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.render('auth/register', {
      title: 'Register',
      errors,
      oldInput: { name, email }
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register',
        errors: ['Email is already registered'],
        oldInput: { name, email }
      });
    }

    await User.create({ name, email, password });

    req.flash('success', 'Registration successful! Please login.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Register error:', err.message);
    res.render('auth/register', {
      title: 'Register',
      errors: ['Something went wrong. Please try again.'],
      oldInput: { name, email }
    });
  }
};



const getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', errors: [], oldInput: {} });
};

const postLogin = async (req, res) => {
  const { email, password } = req.body;


  const { error } = loginSchema.validate({ email, password }, { abortEarly: false });

  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.render('auth/login', {
      title: 'Login',
      errors,
      oldInput: { email }
    });
  }

  try {
    
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        errors: ['Invalid email or password'],
        oldInput: { email }
      });
    }

    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login',
        errors: ['Invalid email or password'],
        oldInput: { email }
      });
    }

   
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

  
    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err.message);
    res.render('auth/login', {
      title: 'Login',
      errors: ['Something went wrong. Please try again.'],
      oldInput: { email }
    });
  }
};



const logout = (req, res) => {
  res.clearCookie('authToken');
  req.flash('success', 'Logged out successfully');
  res.redirect('/auth/login');
};



const getAdminLogin = (req, res) => {
  if (req.cookies.authToken) {
    try {
      const decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET);
      if (decoded.role === 'admin') return res.redirect('/admin');
    } catch(err) {}
  }
  res.render('auth/adminLogin', { title: 'Admin Login', oldInput: {} });
};

const postAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, isActive: true, role: 'admin' });
    if (!user) {
      req.flash('error', 'Invalid admin credentials');
      return res.redirect('/auth/admin/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid admin credentials');
      return res.redirect('/auth/admin/login');
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 
    });

    req.flash('success', 'Welcome back, Admin!');
    res.redirect('/admin');
  } catch(err) {
    req.flash('error', 'Server error during login');
    res.redirect('/auth/admin/login');
  }
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  getAdminLogin,
  postAdminLogin
};