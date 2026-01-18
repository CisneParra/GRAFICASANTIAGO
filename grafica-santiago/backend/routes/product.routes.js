const express = require('express');
const router = express.Router();

// ✅ CORRECCIÓN AQUÍ: Cambiamos a 'ProductController' (con mayúsculas)
// Si tu archivo se llama diferente, asegúrate de que este nombre coincida EXACTO.
const { 
    getProducts, 
    newProduct, 
    getSingleProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/ProductController');

// Importamos el middleware de seguridad
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Rutas Públicas
router.route('/products').get(getProducts);
router.route('/products/:id').get(getSingleProduct);

// Rutas Privadas (Admin)
router.route('/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;