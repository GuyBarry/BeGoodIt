// JavaScript wrapper so Jest can load a TypeScript globalSetup.
// ts-node/register is required because Jest's globalSetup runs outside the
// ts-jest transform pipeline.
require('ts-node').register({
  project: './tsconfig.test.json',
  transpileOnly: true,
});
module.exports = require('./globalSetup.ts').default;
