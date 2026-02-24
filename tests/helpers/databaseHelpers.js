const { createPost } = require('../../databaseQueries');

// Create a test post for comment testing
const createTestPost = async (authorId, content = 'Test post content') => {
  return await createPost(authorId, content);
};

// Create multiple test posts for pagination testing
const createTestPosts = async (authorId, count = 5) => {
  const posts = [];
  for (let i = 1; i <= count; i++) {
    const post = await createPost(authorId, `Test post ${i}`);
    posts.push(post);
  }
  return posts;
};

module.exports = {
  createTestPost,
  createTestPosts
};
