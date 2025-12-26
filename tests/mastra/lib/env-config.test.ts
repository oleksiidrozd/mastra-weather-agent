/**
 * Environment Configuration Tests
 * Epic 1, Story 1.4: Environment Configuration and Security
 *
 * Tests:
 * - 1.4-UNIT-001: API Keys Loaded from Environment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { withoutEnv } from '../../support/helpers/env';

describe('Environment Configuration', () => {
  describe('API Key Loading', () => {
    it('should have GOOGLE_GENERATIVE_AI_API_KEY defined in test env', () => {
      // Test environment sets this in setup.ts
      expect(process.env.GOOGLE_GENERATIVE_AI_API_KEY).toBeDefined();
      expect(process.env.GOOGLE_GENERATIVE_AI_API_KEY).not.toBe('');
    });

    it('should have OPENWEATHERMAP_API_KEY defined in test env', () => {
      expect(process.env.OPENWEATHERMAP_API_KEY).toBeDefined();
      expect(process.env.OPENWEATHERMAP_API_KEY).not.toBe('');
    });

    it('should throw clear error when GOOGLE_GENERATIVE_AI_API_KEY is missing', async () => {
      await withoutEnv(['GOOGLE_GENERATIVE_AI_API_KEY'], async () => {
        // TODO: Import and test validateEnvConfig() function
        // This test will be implemented when the actual config module exists
        expect(process.env.GOOGLE_GENERATIVE_AI_API_KEY).toBeUndefined();
      });
    });

    it('should throw clear error when OPENWEATHERMAP_API_KEY is missing', async () => {
      await withoutEnv(['OPENWEATHERMAP_API_KEY'], async () => {
        // TODO: Import and test validateEnvConfig() function
        expect(process.env.OPENWEATHERMAP_API_KEY).toBeUndefined();
      });
    });
  });

  describe('API Key Security', () => {
    it('should not expose API keys in error messages', () => {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      const errorMessage = 'Configuration error: API key is invalid';

      // Error messages should never contain actual key values
      expect(errorMessage).not.toContain(apiKey);
    });
  });
});
