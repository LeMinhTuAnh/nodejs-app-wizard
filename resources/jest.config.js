module.exports = {
  verbose: true,
  bail: true,
  testURL: 'http://localhost/',
  globals: {
    __DEV__: true,
  },
  watchPathIgnorePatterns: ['<rootDir>/node_modules/'],
};
