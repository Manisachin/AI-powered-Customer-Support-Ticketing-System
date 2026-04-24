const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.post('/ask', auth, aiController.askAI);
router.get('/history', auth, aiController.getChatHistory);

module.exports = router;
