const express = require('express');
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  addOrUpdateReview,
  getReviews,
  deleteReview
} = require('../controllers/ProductController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// Públicas
router.get('/products', getProducts);
router.get('/products/:id', getSingleProduct);
router.get('/products/:id/reviews', getReviews);

// Usuario logueado: crear/actualizar reseña
router.post('/products/:id/reviews', isAuthenticatedUser, addOrUpdateReview);

// Borrar reseña: admin o dueño (validado dentro del controller)
router.delete('/products/:id/reviews/:reviewId', isAuthenticatedUser, deleteReview);

// Admin productos
router.post('/product/new', isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
