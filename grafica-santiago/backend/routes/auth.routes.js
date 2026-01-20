const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.get('/me', isAuthenticatedUser, AuthController.getProfile);
router.put('/me/update', isAuthenticatedUser, AuthController.updateProfile);

// Admin Routes
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), AuthController.getAllUsers);
router.put('/admin/user/:id/role', isAuthenticatedUser, authorizeRoles('admin'), AuthController.updateUserRole);
router.delete('/admin/user/:id', isAuthenticatedUser, authorizeRoles('admin'), AuthController.deleteUser);

module.exports = router;