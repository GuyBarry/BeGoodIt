/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  // Custom environment ensures native typed-array constructors (Float32Array etc.)
  // are shared with the main process so that onnxruntime-node instanceof checks
  // succeed across Jest's vm context boundary (required on Node.js 24+).
  testEnvironment: '<rootDir>/src/__tests__/e2e/setup/e2eEnvironment.js',
  // Force alphabetical file order so clothingClassification (c) always runs
  // before searchAccuracy (s).  searchAccuracy.afterAll deletes the shared state
  // file, so it must be the last file to run.
  testSequencer: '<rootDir>/src/__tests__/e2e/setup/jest-e2e-sequencer.js',
  rootDir: '.',
  testMatch: ['<rootDir>/src/__tests__/e2e/**/*.e2e.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  moduleNameMapper: {
    '^../middlewares/rateLimiter.middleware$': '<rootDir>/src/__tests__/__mocks__/rateLimiter.middleware.ts',
    '^../../middlewares/rateLimiter.middleware$': '<rootDir>/src/__tests__/__mocks__/rateLimiter.middleware.ts',
  },
  // Exclude .js wrapper files so ts-jest does not double-compile them;
  // they use ts-node/register internally to handle their own TypeScript.
  transformIgnorePatterns: ['/node_modules/(?!uuid)', 'e2e/setup/.*\\.js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  // E2E tests call real Gemini API and real DB — allow generous timeout
  testTimeout: 120000,
  // Force-exit after all tests complete so open DB connections do not hang Jest
  forceExit: true,
  globalSetup: '<rootDir>/src/__tests__/e2e/setup/globalSetup.js',
  // globalTeardown is intentionally omitted: test-user cleanup is handled in
  // searchAccuracy.e2e.spec.ts afterAll to avoid ts-jest/ts-node conflicts.
};

