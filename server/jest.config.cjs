module.exports = {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};