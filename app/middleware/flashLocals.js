const jwt = require('jsonwebtoken');

const flashLocals = (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  

  if (req.cookies.authToken) {
    try {
      res.locals.user = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET);
    } catch (e) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  
  next();
};

module.exports = flashLocals;