const request = require('supertest');
const { createTestUser } = require('../helpers/authHelpers');
const { createTestPost } = require('../helpers/databaseHelpers');

// Create a test app that doesn't listen on a port
const express = require('express');
const cors = require('cors');
const { passport } = require('../../middleware/auth');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: '*' }));
  app.use(passport.initialize());

  // Import routes
  const commentRoutes = require('../../routes/commentRoutes');
  app.use('/', commentRoutes);

  return app;
};

describe('Comments API', () => {
  describe('POST /posts/:postId/comments', () => {
    it('should create a comment with valid data', async () => {
      // Arrange: Create test user and post
      const { user, authHeader } = await createTestUser();
      const post = await createTestPost(user.id);
      
      // Act: Create comment
      const app = createTestApp();
      const response = await request(app)
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', authHeader)
        .send({ content: 'This is a test comment' });
      
      // Assert: Should succeed
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content', 'This is a test comment');
      expect(response.body).toHaveProperty('postId', post.id);
      expect(response.body).toHaveProperty('authorId', user.id);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('author');
      expect(response.body.author).toHaveProperty('id', user.id);
      expect(response.body.author).toHaveProperty('username', user.username);
    });

    it('should return 404 when postId is missing', async () => {
      // Act: Create comment without postId
      const app = createTestApp();
      const response = await request(app)
        .post('/posts//comments')  // Empty postId
        .set('Authorization', (await createTestUser()).authHeader)
        .send({ content: 'This is a test comment' });
      
      // Assert: Should fail with 404 (route not found)
      expect(response.status).toBe(404);
    });
  });

  describe('GET /posts/:postId/comments', () => {
    it('should get comments for existing post', async () => {
      // Arrange: Create test user, post, and comments
      const { user, authHeader } = await createTestUser();
      const post = await createTestPost(user.id);
      const app = createTestApp();
      
      // Create some comments
      await request(app)
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', authHeader)
        .send({ content: 'First comment' });
      
      await request(app)
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', authHeader)
        .send({ content: 'Second comment' });
      
      // Act: Get comments
      const response = await request(app)
        .get(`/posts/${post.id}/comments`);
      
      // Assert: Should succeed
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('comments');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.comments).toHaveLength(2);
      expect(response.body.comments[0]).toHaveProperty('content');
      expect(response.body.comments[0]).toHaveProperty('author');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });
  });

  describe('DELETE /comments/:commentId', () => {
    it('should delete comment when author', async () => {
      // Arrange: Create test user, post, and comment
      const { user, authHeader } = await createTestUser();
      const post = await createTestPost(user.id);
      const app = createTestApp();
      
      const createResponse = await request(app)
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', authHeader)
        .send({ content: 'Comment to delete' });
      
      const commentId = createResponse.body.id;
      
      // Act: Delete comment
      const deleteResponse = await request(app)
        .delete(`/comments/${commentId}`)
        .set('Authorization', authHeader);
      
      // Assert: Should succeed
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message', 'Comment deleted successfully');
      expect(deleteResponse.body).toHaveProperty('deletedCommentId', commentId);
    });

    it('should return 404 when trying to delete non-existent comment', async () => {
      // Arrange: Create test user
      const { authHeader } = await createTestUser();
      const app = createTestApp();
      
      // Act: Try to delete non-existent comment
      const response = await request(app)
        .delete('/comments/99999')
        .set('Authorization', authHeader);
      
      // Assert: Should fail
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Comment not found');
    });

    it('should return 404 when trying to delete other user\'s comment', async () => {
      // Arrange: Create two users, post, and comment by first user
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const post = await createTestPost(user1.user.id);
      const app = createTestApp();
      
      const createResponse = await request(app)
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', user1.authHeader)
        .send({ content: 'User 1 comment' });
      
      const commentId = createResponse.body.id;
      
      // Act: Try to delete with second user
      const response = await request(app)
        .delete(`/comments/${commentId}`)
        .set('Authorization', user2.authHeader);
      
      // Assert: Should fail with 404 (comment not found for this user)
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Comment not found');
    });
  });
});
