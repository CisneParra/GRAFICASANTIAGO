const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.get('/me', isAuthenticatedUser, AuthController.getProfile);
router.put('/me/update', isAuthenticatedUser, AuthController.updateProfile);

// Admin
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), AuthController.getAllUsers);

module.exports = router;
