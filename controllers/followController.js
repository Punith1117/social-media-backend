const { createFollow, deleteFollow, getFollowers, getFollowing, getFollowStats, findUserById } = require('../databaseQueries');
const { formatErrorResponse } = require('../utils');

const followUser = async (req, res) => {
    try {
        const { followingId } = req.params;
        const followerId = req.user.id;

        if (!followingId || isNaN(parseInt(followingId))) {
            return res.status(400).json(formatErrorResponse('Valid followingId is required', 'followingId'));
        }

        const followingIdNum = parseInt(followingId);

        if (followerId === followingIdNum) {
            return res.status(400).json(formatErrorResponse('Cannot follow yourself', 'followingId'));
        }

        const targetUser = await findUserById(followingIdNum);
        if (!targetUser) {
            return res.status(404).json(formatErrorResponse('User to follow not found', 'followingId'));
        }

        const follow = await createFollow(followerId, followingIdNum);

        res.status(201).json({
            message: 'User followed successfully',
            follow: {
                id: follow.id,
                followerId: follow.followerId,
                followingId: follow.followingId,
                createdAt: follow.createdAt
            }
        });
    } catch (error) {
        console.error('Follow error:', error);
        if (error.message === 'Already following this user') {
            return res.status(409).json(formatErrorResponse('Already following this user', 'followingId'));
        }
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const unfollowUser = async (req, res) => {
    try {
        const { followingId } = req.params;
        const followerId = req.user.id;

        if (!followingId || isNaN(parseInt(followingId))) {
            return res.status(400).json(formatErrorResponse('Valid followingId is required', 'followingId'));
        }

        const followingIdNum = parseInt(followingId);

        const follow = await deleteFollow(followerId, followingIdNum);

        res.status(200).json({
            message: 'User unfollowed successfully',
            follow: {
                id: follow.id,
                followerId: follow.followerId,
                followingId: follow.followingId,
                createdAt: follow.createdAt
            }
        });
    } catch (error) {
        console.error('Unfollow error:', error);
        if (error.message === 'Not following this user') {
            return res.status(404).json(formatErrorResponse('Not following this user', 'followingId'));
        }
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getFollowersList = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json(formatErrorResponse('Valid userId is required', 'userId'));
        }

        const userIdNum = parseInt(userId);
        const followers = await getFollowers(userIdNum);

        res.status(200).json({
            followers,
            count: followers.length
        });
    } catch (error) {
        console.error('Get followers error:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getFollowingList = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json(formatErrorResponse('Valid userId is required', 'userId'));
        }

        const userIdNum = parseInt(userId);
        const following = await getFollowing(userIdNum);

        res.status(200).json({
            following,
            count: following.length
        });
    } catch (error) {
        console.error('Get following error:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getFollowStatsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user ? req.user.id : null;

        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json(formatErrorResponse('Valid userId is required', 'userId'));
        }

        const userIdNum = parseInt(userId);
        const stats = await getFollowStats(userIdNum, currentUserId);

        res.status(200).json(stats);
    } catch (error) {
        console.error('Get follow stats error:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowersList,
    getFollowingList,
    getFollowStats: getFollowStatsController
};
