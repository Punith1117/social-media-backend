const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createCommentController } = require('../controllers/commentController');

// POST /posts/:postId/comments - Create comment (requires auth)
router.post('/posts/:postId/comments', authenticate, createCommentController);

module.exports = router;
