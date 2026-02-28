const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { getHomeFeedController, getExploreController } = require('../controllers/postController');

// GET /feed/home - Get home feed with cursor pagination (requires auth)
router.get('/home', authenticate, getHomeFeedController);

// GET /feed/explore - Get explore feed with cursor pagination (public, optional auth)
router.get('/explore', optionalAuth, getExploreController);

module.exports = router;
