// Config for pure unit tests (utilities, formatters, constants, etc.)
// These don't need React Native or Expo
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: false }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '**/src/__tests__/**/formatters.test.ts',
    '**/src/__tests__/**/constants.test.ts',
  ],
  modulePathIgnorePatterns: ['<rootDir>/homenest-main/'],
  transformIgnorePatterns: ['node_modules/(?!(date-fns)/)'],
};
