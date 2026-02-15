const express = require('express');
const { followUser, unfollowUser, getFollowersList, getFollowingList, getFollowStats } = require('../controllers/followController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Write operations - require authentication
router.post('/:followingId', authenticate, followUser);
router.delete('/:followingId', authenticate, unfollowUser);

// Read operations - public (no authentication required)
router.get('/followers/:userId', getFollowersList);
router.get('/following/:userId', getFollowingList);

// Stats endpoint - optional authentication (works both ways)
router.get('/stats/:userId', optionalAuth, getFollowStats);

module.exports = router;
