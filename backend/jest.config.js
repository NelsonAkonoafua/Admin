module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/tests/**', '!src/utils/seed.js'],
  setupFiles: ['dotenv/config']
};
