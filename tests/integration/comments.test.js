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
});
