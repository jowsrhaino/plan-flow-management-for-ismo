const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authMiddleware');
const { askChatbot } = require('../controllers/chatbotController');

router.use(authenticateJWT);
router.post('/ask', askChatbot);

module.exports = router;
