const express = require('express');
const router = express.Router();

const ReportController = require('../controllers/report.controller');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/summary', isAuthenticatedUser, authorizeRoles('admin'), ReportController.getSummary);

module.exports = router;
