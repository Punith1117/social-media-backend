const express = require('express');
const { getUserDetails, getOwnUserDetails, updateUserDetails, uploadProfilePhoto, deleteProfilePhoto } = require('../controllers/userDetailsController');
const { authenticate } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Authenticated endpoints - require authentication
router.get('/me', authenticate, getOwnUserDetails);
router.put('/me', authenticate, updateUserDetails);

// Profile photo endpoints
router.post('/me/photo', authenticate, upload.single('photo'), handleUploadError, uploadProfilePhoto);
router.delete('/me/photo', authenticate, deleteProfilePhoto);

// Public endpoint - no authentication required
router.get('/:username', getUserDetails);


module.exports = router;
