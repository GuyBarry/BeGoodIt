/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/src/__tests__/e2e/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  transformIgnorePatterns: ['/node_modules/(?!uuid)'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    '^.+\\.js$': ['ts-jest', { useESM: false }],
  },
};
