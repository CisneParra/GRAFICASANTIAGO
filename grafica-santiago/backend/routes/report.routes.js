const express = require('express');
const router = express.Router();

// Importamos el controlador de reportes (Lo crearemos en el paso 2 por si acaso)
const { 
    getSalesReport, 
    getBestSellers, 
    getLowStock 
} = require('../controllers/report.controller');

// ✅ CORRECCIÓN AQUÍ: Apuntamos a 'middlewares/auth' (Plural y sin .middleware)
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// Rutas de Reportes (Protegidas solo para Admin)
router.route('/reports/sales').get(isAuthenticatedUser, authorizeRoles('admin'), getSalesReport);
router.route('/reports/best-sellers').get(isAuthenticatedUser, authorizeRoles('admin'), getBestSellers);
router.route('/reports/low-stock').get(isAuthenticatedUser, authorizeRoles('admin'), getLowStock);

module.exports = router;