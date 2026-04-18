/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  transformIgnorePatterns: ['/node_modules/(?!uuid)'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    '^.+\\.js$': ['ts-jest', { useESM: false }],
  },
};
