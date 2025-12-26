/**
 * Global test setup
 * Runs before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Store original env
const originalEnv = { ...process.env };

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Set test API keys (mocked - never use real keys in tests)
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-google-api-key';
  process.env.OPENWEATHERMAP_API_KEY = 'test-openweathermap-key';
});

afterAll(() => {
  // Restore original environment
  process.env = { ...originalEnv };
});

beforeEach(() => {
  // Reset mocks before each test
});

afterEach(() => {
  // Cleanup after each test
});

// Global test utilities
declare global {
  // Add any global test utilities here
}
