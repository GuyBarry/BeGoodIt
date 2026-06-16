/**
 * Custom Jest test environment for E2E tests.
 *
 * Jest's default Node environment runs each test file in an isolated vm context,
 * which means built-in constructors like Float32Array come from that vm context
 * rather than the main Node.js process. Native modules such as onnxruntime-node
 * perform strict `instanceof` checks against the constructor from *their* realm,
 * causing errors like:
 *   TypeError: A float32 tensor's data must be type of function Float32Array() { [native code] }
 *
 * The fix is to copy the main-process typed-array globals into the vm context
 * so that `instanceof` checks succeed across the realm boundary.
 */
const { TestEnvironment } = require('jest-environment-node');

class E2ETestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    // Overwrite typed-array constructors with those from the main process so
    // that native modules that rely on instanceof checks work correctly.
    this.global.Float32Array = Float32Array;
    this.global.Float64Array = Float64Array;
    this.global.Int8Array = Int8Array;
    this.global.Int16Array = Int16Array;
    this.global.Int32Array = Int32Array;
    this.global.Uint8Array = Uint8Array;
    this.global.Uint8ClampedArray = Uint8ClampedArray;
    this.global.Uint16Array = Uint16Array;
    this.global.Uint32Array = Uint32Array;
    this.global.BigInt64Array = BigInt64Array;
    this.global.BigUint64Array = BigUint64Array;
    this.global.ArrayBuffer = ArrayBuffer;
    this.global.SharedArrayBuffer = SharedArrayBuffer;
    this.global.Buffer = Buffer;
  }
}

module.exports = E2ETestEnvironment;
