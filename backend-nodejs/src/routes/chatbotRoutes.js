const express = require('express');
const router = express.Router();
const {
  chatQuery,
  initializeKnowledgeBase,
  chatbotHealth,
} = require('../controllers/chatbotController');
const { protect, admin } = require('../middlewares/auth');

router.post('/query', chatQuery);
router.post('/initialize', protect, admin, initializeKnowledgeBase);
router.get('/health', chatbotHealth);

module.exports = router;
