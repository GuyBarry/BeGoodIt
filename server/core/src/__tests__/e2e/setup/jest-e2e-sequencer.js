/**
 * Custom Jest test sequencer for E2E tests.
 *
 * Jest's default sequencer re-orders test files based on cached run durations
 * (slowest last / previously-failed first), which can put searchAccuracy.e2e.spec.ts
 * before clothingClassification.e2e.spec.ts.  That breaks the teardown contract:
 * searchAccuracy.afterAll deletes the shared .e2e-test-state.json file, so any
 * test file that runs after it can no longer read the test-user ID.
 *
 * This sequencer forces strict alphabetical order so the state file is only
 * deleted by the last test file that runs (searchAccuracy, s > c).
 */
const Sequencer = require('@jest/test-sequencer').default;

class E2ESequencer extends Sequencer {
  sort(tests) {
    return [...tests].sort((a, b) => a.path.localeCompare(b.path));
  }
}

module.exports = E2ESequencer;
