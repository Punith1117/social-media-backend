const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getHomeFeedController } = require('../controllers/postController');

// GET /feed/home - Get home feed with cursor pagination (requires auth)
router.get('/home', authenticate, getHomeFeedController);

module.exports = router;
