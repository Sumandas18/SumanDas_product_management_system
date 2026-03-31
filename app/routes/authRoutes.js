const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');


router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/logout', authController.logout);


router.get('/admin/login', authController.getAdminLogin);
router.post('/admin/login', authController.postAdminLogin);

module.exports = router;