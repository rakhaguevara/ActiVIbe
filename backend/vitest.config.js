import { defineConfig } from 'vitest/config'

// fileParallelism: false — every integration test file shares the same
// activivibe_db_test database and wipes tables in beforeEach; running test
// files in parallel workers would race on that cleanup.
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
  },
})
