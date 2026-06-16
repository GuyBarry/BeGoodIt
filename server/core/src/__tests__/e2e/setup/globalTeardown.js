require('ts-node').register({
  project: './tsconfig.test.json',
  transpileOnly: true,
});
module.exports = require('./globalTeardown.ts').default;
