const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.use(authenticateJWT);
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;