const path = require('path');

const express = require('express');
const {check,body }= require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',[
    body('title')
    .isString()
    .isLength({min:3})
    .trim(),

    // body('image'),

    body('price').isFloat(),

    body('description')
        .isLength({min:5 ,max:400})
        .trim()
    
    
   
], isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body('title')
    .isString()
    .isLength({min:3})
    .trim(),

    // body('imageUrl').isURL(),

    body('price').isFloat(),

    body('description')
        .isLength({min:5 ,max:400})
        .trim()
] , isAuth, adminController.postEditProduct);

// TODOThe below code works for a non asynchronous delete operation
// router.post('/delete-product', isAuth, adminController.postDeleteProduct);

// TODOThe below code works for an asynchronous delete operation
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
