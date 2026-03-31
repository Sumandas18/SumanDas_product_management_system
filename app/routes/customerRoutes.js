const express = require('express');
const router = express.Router();
const customerController = require('../controller/customerController');


router.get('/', customerController.getHome);


router.get('/product/:identifier', customerController.getProductDetail);

module.exports = router;
