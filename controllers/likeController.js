const { createLike, deleteLike, getLikeByUserAndPost } = require('../databaseQueries');
const { formatErrorResponse } = require('../utils');

const likePostController = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const postIdNum = parseInt(postId);

        if (isNaN(postIdNum)) {
            return res.status(400).json(formatErrorResponse('Invalid post ID', 'postId'));
        }

        const existingLike = await getLikeByUserAndPost(userId, postIdNum);
        if (existingLike) {
            return res.status(409).json(formatErrorResponse('Post already liked', 'postId'));
        }

        const like = await createLike(userId, postIdNum);
        res.status(201).json({ 
            message: 'Post liked successfully', 
            likeId: like.id 
        });
    } catch (error) {
        console.error('Error liking post:', error);
        if (error.code === 'P2003') {
            return res.status(404).json(formatErrorResponse('Post not found', 'postId'));
        }
        if (error.code === 'P2002') {
            return res.status(409).json(formatErrorResponse('Post already liked', 'postId'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const unlikePostController = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const postIdNum = parseInt(postId);

        if (isNaN(postIdNum)) {
            return res.status(400).json(formatErrorResponse('Invalid post ID', 'postId'));
        }

        const deletedLikeId = await deleteLike(userId, postIdNum);
        if (!deletedLikeId) {
            return res.status(404).json(formatErrorResponse('Like not found', 'postId'));
        }

        res.status(200).json({ 
            message: 'Post unliked successfully', 
            likeId: deletedLikeId 
        });
    } catch (error) {
        console.error('Error unliking post:', error);
        if (error.code === 'P2025') {
            return res.status(404).json(formatErrorResponse('Like not found', 'postId'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

module.exports = {
    likePostController,
    unlikePostController
};
