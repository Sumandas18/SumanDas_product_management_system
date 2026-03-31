const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');


const dashboardController = require('../controller/adminDashboardController');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');


router.use(adminAuth);


router.get('/', dashboardController.getDashboard);


router.get('/categories', categoryController.getCategories);
router.get('/categories/add', categoryController.getAddCategory);
router.post('/categories/add', categoryController.postAddCategory);
router.get('/categories/edit/:id', categoryController.getEditCategory);
router.post('/categories/edit/:id', categoryController.postEditCategory);
router.delete('/categories/delete/:id', categoryController.postDeleteCategory);


router.get('/products', productController.getProducts);
router.get('/products/add', productController.getAddProduct);
router.post('/products/add', upload.single('image'), productController.postAddProduct);
router.get('/products/edit/:id', productController.getEditProduct);
router.post('/products/edit/:id', upload.single('image'), productController.postEditProduct);
router.delete('/products/delete/:id', productController.postDeleteProduct);

module.exports = router;
