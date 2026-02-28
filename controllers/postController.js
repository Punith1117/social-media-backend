const {
    createPost,
    getPostById,
    getPostsByUser,
    countPostsByUser,
    updatePost,
    deletePost,
    getUserDetails,
    getLikesByUserForPosts,
    getFeedPosts,
    getExplorePosts
} = require('../databaseQueries');
const { formatErrorResponse, normalizeUsername, validatePagination, validatePostContent, encodeCursor, validateCursor } = require('../utils');

const createPostController = async (req, res) => {
    try {
        const { content } = req.body;
        const authorId = req.user.id;

        // Validate post content using shared function
        const contentValidation = validatePostContent(content);
        if (!contentValidation.valid) {
            return res.status(400).json(formatErrorResponse(contentValidation.error, 'content'));
        }

        const post = await createPost(authorId, content.trim());
        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getPostByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const postIdNum = parseInt(id);

        if (isNaN(postIdNum)) {
            return res.status(400).json(formatErrorResponse('Invalid post ID', 'id'));
        }

        const post = await getPostById(postIdNum);
        
        if (!post) {
            return res.status(404).json(formatErrorResponse('Post not found', 'id'));
        }

        // Get like status for authenticated users
        let isLikedByCurrentUser = false;
        if (req.user) {
            const likedPostIds = await getLikesByUserForPosts(req.user.id, [post.id]);
            isLikedByCurrentUser = likedPostIds.has(post.id);
        }

        const responsePost = {
            id: post.id,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author,
            likesCount: post._count.likes,
            isLikedByCurrentUser
        };

        res.status(200).json({ post: responsePost });
    } catch (error) {
        console.error('Error getting post by ID:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getPostsByUserController = async (req, res) => {
    try {
        const { username } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Normalize username at API boundary
        const normalizedUsername = normalizeUsername(username);

        if (!username) {
            return res.status(400).json(formatErrorResponse('Username is required', 'username'));
        }

        // Get user details to get user ID
        const user = await getUserDetails(normalizedUsername);
        if (!user) {
            return res.status(404).json(formatErrorResponse('User not found', 'username'));
        }

        // Validate pagination using shared function
        const paginationValidation = validatePagination(page, limit);
        if (!paginationValidation.valid) {
            return res.status(400).json(paginationValidation.error);
        }

        const { pageNum, limitNum } = paginationValidation;

        const [posts, totalCount] = await Promise.all([
            getPostsByUser(user.id, pageNum, limitNum),
            countPostsByUser(user.id)
        ]);

        // Transform posts to include likesCount and isLikedByCurrentUser
        const likedPostIds = req.user ? await getLikesByUserForPosts(req.user.id, posts.map(post => post.id)) : new Set();
        const transformedPosts = posts.map(post => ({
            id: post.id,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            likesCount: post._count.likes,
            isLikedByCurrentUser: likedPostIds.has(post.id)
        }));

        res.status(200).json({
            posts: transformedPosts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting posts by user:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getOwnPostsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        // Validate pagination using shared function
        const paginationValidation = validatePagination(page, limit);
        if (!paginationValidation.valid) {
            return res.status(400).json(paginationValidation.error);
        }

        const { pageNum, limitNum } = paginationValidation;

        const [posts, totalCount] = await Promise.all([
            getPostsByUser(userId, pageNum, limitNum),
            countPostsByUser(userId)
        ]);

        // Transform posts to include likesCount and isLikedByCurrentUser
        const likedPostIds = req.user ? await getLikesByUserForPosts(req.user.id, posts.map(post => post.id)) : new Set();
        const transformedPosts = posts.map(post => ({
            id: post.id,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            likesCount: post._count.likes,
            isLikedByCurrentUser: likedPostIds.has(post.id)
        }));

        res.status(200).json({
            posts: transformedPosts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        });
    } catch (error) {
        console.error('Error getting own posts:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const updatePostController = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const authorId = req.user.id;

        const postIdNum = parseInt(id);

        if (isNaN(postIdNum)) {
            return res.status(400).json(formatErrorResponse('Invalid post ID', 'id'));
        }

        // Validate post content using shared function
        const contentValidation = validatePostContent(content);
        if (!contentValidation.valid) {
            return res.status(400).json(formatErrorResponse(contentValidation.error, 'content'));
        }

        const updatedPost = await updatePost(postIdNum, authorId, content.trim());

        if (!updatedPost) {
            return res.status(404).json(formatErrorResponse('Post not found or unauthorized', 'id'));
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const deletePostController = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;

        const postIdNum = parseInt(id);

        if (isNaN(postIdNum)) {
            return res.status(400).json(formatErrorResponse('Invalid post ID', 'id'));
        }

        const deletedPostId = await deletePost(postIdNum, authorId);

        if (!deletedPostId) {
            return res.status(404).json(formatErrorResponse('Post not found or unauthorized', 'id'));
        }

        res.status(200).json({ message: 'Post deleted successfully', postId: deletedPostId });
    } catch (error) {
        console.error('Error deleting post:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getHomeFeedController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cursor, limit = 10 } = req.query;

        // Validate limit
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            return res.status(400).json(formatErrorResponse('Invalid limit (must be between 1 and 50)', 'limit'));
        }

        // Validate cursor
        const cursorValidation = validateCursor(cursor);
        if (!cursorValidation.valid) {
            return res.status(400).json(cursorValidation.error);
        }

        const decodedCursor = cursorValidation.decodedCursor;

        // Get posts from database
        const posts = await getFeedPosts(userId, decodedCursor, limitNum);

        // Determine if there are more posts
        const hasMore = posts.length > limitNum;
        const displayPosts = hasMore ? posts.slice(0, -1) : posts;

        // Transform posts to match response format
        const transformedPosts = displayPosts.map(post => ({
            id: post.id,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isLikedByCurrentUser: post.likes.length > 0
        }));

        // Generate next cursor if there are more posts
        let nextCursor = null;
        if (hasMore && displayPosts.length > 0) {
            const lastPost = displayPosts[displayPosts.length - 1];
            nextCursor = encodeCursor({ id: lastPost.id, createdAt: lastPost.createdAt });
        }

        res.status(200).json({
            posts: transformedPosts,
            nextCursor,
            hasMore
        });
    } catch (error) {
        console.error('Error getting home feed:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

const getExploreController = async (req, res) => {
    try {
        const userId = req.user?.id; // Optional auth
        const { cursor, limit = 10 } = req.query;

        // Validate limit
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            return res.status(400).json(formatErrorResponse('Invalid limit (must be between 1 and 50)', 'limit'));
        }

        // Validate cursor
        const cursorValidation = validateCursor(cursor);
        if (!cursorValidation.valid) {
            return res.status(400).json(cursorValidation.error);
        }

        const decodedCursor = cursorValidation.decodedCursor;

        // Get posts without likes (optimized approach)
        const posts = await getExplorePosts(decodedCursor, limitNum);

        // Determine if there are more posts
        const hasMore = posts.length > limitNum;
        const displayPosts = hasMore ? posts.slice(0, -1) : posts;

        // ✅ Optimized like status approach
        let likedPostIds = new Set();
        if (userId && displayPosts.length > 0) {
            const postIds = displayPosts.map(post => post.id);
            likedPostIds = await getLikesByUserForPosts(userId, postIds);
        }

        // Transform posts with O(1) like lookup
        const transformedPosts = displayPosts.map(post => ({
            id: post.id,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isLikedByCurrentUser: userId ? likedPostIds.has(post.id) : false
        }));

        // Generate next cursor if there are more posts
        let nextCursor = null;
        if (hasMore && displayPosts.length > 0) {
            const lastPost = displayPosts[displayPosts.length - 1];
            nextCursor = encodeCursor({ id: lastPost.id, createdAt: lastPost.createdAt });
        }

        res.status(200).json({
            posts: transformedPosts,
            nextCursor,
            hasMore
        });
    } catch (error) {
        console.error('Error getting explore posts:', error);
        if (error.message.includes('Database error')) {
            return res.status(500).json(formatErrorResponse('Database operation failed'));
        }
        res.status(500).json(formatErrorResponse('Internal server error'));
    }
};

module.exports = {
    createPostController,
    getPostByIdController,
    getPostsByUserController,
    getOwnPostsController,
    updatePostController,
    deletePostController,
    getHomeFeedController,
    getExploreController
};
