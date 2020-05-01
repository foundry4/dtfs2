module.exports = {
  collectCoverageFrom: [
    'server/helpers/**/*.{js,}',
    'scripts/**/*.{js,}',
  ],
  coverageDirectory: 'reports/coverage/unit',
  testMatch: ['**/*.test.js', '**/*.component-test.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest'
  }
};
