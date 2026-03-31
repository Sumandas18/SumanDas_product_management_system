const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    req.flash('error', 'Please log in to access the admin panel');
    return res.redirect('/auth/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      req.flash('error', 'Unauthorized access. Admins only.');
      return res.redirect('/');
    }
    
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    req.flash('error', 'Session expired. Please log in again.');
    res.redirect('/auth/admin/login');
  }
};

module.exports = adminAuth;