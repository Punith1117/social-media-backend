const express = require('express');
const { getUserDetails, getOwnUserDetails, updateUserDetails } = require('../controllers/userDetailsController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Authenticated endpoints - require authentication
router.get('/me', authenticate, getOwnUserDetails);
router.put('/me', authenticate, updateUserDetails);

// Public endpoint - no authentication required
router.get('/:username', getUserDetails);


module.exports = router;
