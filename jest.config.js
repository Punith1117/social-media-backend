module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'utils.js',
    'databaseQueries.js',
    '!**/node_modules/**'
  ]
};
