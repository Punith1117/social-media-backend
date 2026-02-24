const bcrypt = require('bcryptjs');
const { createUser } = require('../../databaseQueries');
const { generateToken } = require('../../utils');

// Create a test user and return user with token
const createTestUser = async (username = 'testuser', password = 'testpass123') => {
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await createUser(username, hashedPassword);
  const token = generateToken(user.id, user.username);
  
  return {
    user,
    token,
    authHeader: `Bearer ${token}`
  };
};

// Generate JWT token for existing user
const generateTestToken = (userId, username) => {
  return generateToken(userId, username);
};

module.exports = {
  createTestUser,
  generateTestToken
};
