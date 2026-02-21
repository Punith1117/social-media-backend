const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    createPostController,
    getPostByIdController,
    updatePostController,
    deletePostController
} = require('../controllers/postController');

// POST /api/posts - Create new post (requires auth)
router.post('/', authenticate, createPostController);

// GET /api/posts/:id - Get post by ID (public)
router.get('/:id', getPostByIdController);

// PUT /api/posts/:id - Update post (requires auth)
router.put('/:id', authenticate, updatePostController);

// DELETE /api/posts/:id - Delete post (requires auth)
router.delete('/:id', authenticate, deletePostController);

module.exports = router;
