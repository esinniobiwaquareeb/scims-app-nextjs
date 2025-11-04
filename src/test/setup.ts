/**
 * Test setup file
 * Runs before all tests
 */

// Mock environment variables for testing
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'https://test.supabase.co';
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
}
if (!process.env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
}
// NODE_ENV is read-only, but tests will run in 'test' mode by default in vitest

// Suppress console logs in tests unless explicitly needed
if (process.env.VITEST_VERBOSE !== 'true') {
  global.console = {
    ...console,
    log: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
}

