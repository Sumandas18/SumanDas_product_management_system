require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./app/config/db');
const flashLocals = require('./app/middleware/flashLocals');

const adminRoutes = require('./app/routes/adminRoutes');
const customerRoutes = require('./app/routes/customerRoutes');
const authRoutes = require('./app/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

const User = require('./app/models/User');
User.findOne({ role: 'admin' }).then(async adminExists => {
  if (!adminExists) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'Admin1234',
      role: 'admin'
    });
    console.log('Default Admin account seeded: admin@gmail.com');
  }
}).catch(err => console.error('Error seeding admin:', err.message));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use(flashLocals);

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/', customerRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});
const port = 4005;
app.listen(port, (error) => {
  if (error) {
    console.log("Error starting server:", error);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});