const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logout, updateProfile } = require('../controllers/auth.controller');
const { isAuthenticatedUser } = require('../middlewares/auth');

// Rutas Públicas
router.route('/auth/register').post(registerUser);
router.route('/auth/login').post(loginUser);
router.route('/auth/logout').get(logout);

// Rutas Privadas (Requieren Login)
// HU-006: Ruta para editar perfil
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

module.exports = router;