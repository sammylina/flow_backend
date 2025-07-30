// Test setup file
// This file is run before all tests to set up the test environment

// Ensure NODE_ENV is set to 'test' for all tests
process.env.NODE_ENV = 'test';

// Set up any other test-specific environment variables if needed
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/flow_db_test?schema=public';
}
