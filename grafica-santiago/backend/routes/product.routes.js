const express = require('express');
const router = express.Router();

// 👇 IMPORTACIÓN EXACTA
const { 
    getProducts, 
    newProduct, 
    getSingleProduct, 
    deleteProduct, 
    updateProduct, 
    createProductReview 
} = require('../controllers/ProductController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// Rutas Públicas
router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);

// Ruta de Reseñas (Usuarios Logueados)
router.put('/review', isAuthenticatedUser, createProductReview);

// Rutas Admin/Bodega
router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin', 'bodega'), newProduct);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin', 'bodega'), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin', 'bodega'), deleteProduct);

module.exports = router;