const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createCommentController, getCommentsByPostController, deleteCommentController } = require('../controllers/commentController');

// POST /posts/:postId/comments - Create comment (requires auth)
router.post('/posts/:postId/comments', authenticate, createCommentController);

// GET /posts/:postId/comments - Get comments (public, with pagination)
router.get('/posts/:postId/comments', getCommentsByPostController);

// DELETE /comments/:commentId - Delete comment (requires auth, author only)
router.delete('/comments/:commentId', authenticate, deleteCommentController);

module.exports = router;
