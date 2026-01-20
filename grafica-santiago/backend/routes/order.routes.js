const express = require('express');
const router = express.Router();

const {
    newOrder,
    getSingleOrder,
    myOrders,
    allOrders,   // <--- Verifica que esto coincida con el controller
    updateOrder, // <--- Verifica que esto coincida con el controller
    deleteOrder  // <--- Verifica que esto coincida con el controller
} = require('../controllers/order.controller');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// Rutas Usuario
router.post('/order/new', isAuthenticatedUser, newOrder);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);
router.get('/orders/me', isAuthenticatedUser, myOrders);

// Rutas Admin
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;