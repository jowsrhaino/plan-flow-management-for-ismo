const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation } = require('../middleware/validator');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Public Routes (Rate Limiting & Validation உண்டு)
router.post('/register', authRateLimiter, registerValidation, authController.register);
router.post('/login', authRateLimiter, loginValidation, authController.login);
router.post('/logout', authController.logout);

// Protected Route (Token இருந்தால் மட்டுமே Profile பார்க்க முடியும்)
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;