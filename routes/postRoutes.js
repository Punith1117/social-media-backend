const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
    createPostController,
    getPostByIdController,
    updatePostController,
    deletePostController
} = require('../controllers/postController');
const {
    likePostController,
    unlikePostController
} = require('../controllers/likeController');

// POST /posts - Create new post (requires auth)
router.post('/', authenticate, createPostController);

// GET /posts/:id - Get post by ID (public, with optional auth for like status)
router.get('/:id', optionalAuth, getPostByIdController);

// PUT /posts/:id - Update post (requires auth)
router.put('/:id', authenticate, updatePostController);

// DELETE /posts/:id - Delete post (requires auth)
router.delete('/:id', authenticate, deletePostController);

// POST /posts/:postId/like - Like a post (requires auth)
router.post('/:postId/like', authenticate, likePostController);

// DELETE /posts/:postId/like - Unlike a post (requires auth)
router.delete('/:postId/like', authenticate, unlikePostController);

module.exports = router;
