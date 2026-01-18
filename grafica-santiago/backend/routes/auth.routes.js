const express = require('express');
const router = express.Router();

// CORRECCIÓN AQUÍ: Importamos desde '../controllers/AuthController'
// (Asegúrate de que el archivo en controllers se llame exactamente "AuthController.js")
const { registerUser, loginUser, logout, updateProfile } = require('../controllers/AuthController');
const { isAuthenticatedUser } = require('../middlewares/auth');

// Rutas Públicas
router.route('/auth/register').post(registerUser);
router.route('/auth/login').post(loginUser);
router.route('/auth/logout').get(logout);

// Rutas Privadas
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

module.exports = router;