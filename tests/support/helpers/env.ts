/**
 * Environment helpers for testing
 */

/**
 * Temporarily set environment variables for a test
 */
export function withEnv(
  vars: Record<string, string | undefined>,
  fn: () => void | Promise<void>
): Promise<void> | void {
  const original: Record<string, string | undefined> = {};

  // Save originals and set new values
  for (const [key, value] of Object.entries(vars)) {
    original[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  const restore = () => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}

/**
 * Clear specific environment variables for testing missing keys
 */
export function withoutEnv(
  keys: string[],
  fn: () => void | Promise<void>
): Promise<void> | void {
  const vars: Record<string, undefined> = {};
  for (const key of keys) {
    vars[key] = undefined;
  }
  return withEnv(vars, fn);
}
