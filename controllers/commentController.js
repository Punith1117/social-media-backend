const { createComment, getPostById, getCommentsByPost, countCommentsByPost } = require('../databaseQueries');
const { formatErrorResponse, validatePagination } = require('../utils');

const createCommentController = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const authorId = req.user.id;

        // Validate postId exists
        if (!postId) {
            return res.status(400).json(formatErrorResponse('Post ID is required', 'postId'));
        }

        // Validate post exists
        const post = await getPostById(parseInt(postId));
        if (!post) {
            return res.status(404).json(formatErrorResponse('Post not found', 'postId'));
        }

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json(formatErrorResponse('Content is required', 'content'));
        }

        if (content.length > 100) {
            return res.status(400).json(formatErrorResponse('Content must be 100 characters or less', 'content'));
        }

        // Create comment
        const comment = await createComment(parseInt(postId), authorId, content.trim());
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getCommentsByPostController = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = '1', limit = '10' } = req.query;

        // Validate postId exists
        if (!postId) {
            return res.status(400).json(formatErrorResponse('Post ID is required', 'postId'));
        }

        // Validate pagination
        const paginationValidation = validatePagination(page, limit);
        if (!paginationValidation.valid) {
            return res.status(400).json(paginationValidation.error);
        }

        // Validate post exists
        const post = await getPostById(parseInt(postId));
        if (!post) {
            return res.status(404).json(formatErrorResponse('Post not found', 'postId'));
        }

        // Get comments and count
        const [comments, total] = await Promise.all([
            getCommentsByPost(parseInt(postId), paginationValidation.pageNum, paginationValidation.limitNum),
            countCommentsByPost(parseInt(postId))
        ]);

        const totalPages = Math.ceil(total / paginationValidation.limitNum);

        res.status(200).json({
            comments,
            pagination: {
                page: paginationValidation.pageNum,
                limit: paginationValidation.limitNum,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error getting comments:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

module.exports = {
    createCommentController,
    getCommentsByPostController
};
