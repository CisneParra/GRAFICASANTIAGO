const express = require('express');
const router = express.Router();

const CartController = require('../controllers/CartController');
const { isAuthenticatedUser } = require('../middleware/auth.middleware');

router.get('/cart', isAuthenticatedUser, CartController.getCart);
router.post('/cart/add', isAuthenticatedUser, CartController.addItemToCart);
router.delete('/cart/remove/:id', isAuthenticatedUser, CartController.removeCartItem);

module.exports = router;
