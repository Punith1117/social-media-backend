const express = require('express');
const { getUserDetails, getOwnUserDetails, updateUserDetails, uploadProfilePhoto, deleteProfilePhoto, searchUsers } = require('../controllers/userDetailsController');
const { getPostsByUserController, getOwnPostsController } = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Search endpoint - no authentication required
router.get('/', searchUsers);

// Authenticated endpoints - require authentication
router.get('/me', authenticate, getOwnUserDetails);
router.put('/me', authenticate, updateUserDetails);
router.get('/me/posts', authenticate, getOwnPostsController);

// Profile photo endpoints
router.post('/me/photo', authenticate, upload.single('photo'), handleUploadError, uploadProfilePhoto);
router.delete('/me/photo', authenticate, deleteProfilePhoto);

// Posts by username endpoint - public with optional auth for like status
router.get('/:username/posts', optionalAuth, getPostsByUserController);

// Public endpoint - no authentication required
router.get('/:username', getUserDetails);


module.exports = router;
