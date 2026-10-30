import { afterEach, beforeEach } from '@jest/globals';

export const TEST_OMDB_API_KEY = 'test-key-not-a-real-credential';

export function setupOmdbTestEnvironment() {
  let originalKey: string | undefined;

  beforeEach(() => {
    originalKey = process.env.EXPO_PUBLIC_OMDB_API_KEY;
    process.env.EXPO_PUBLIC_OMDB_API_KEY = TEST_OMDB_API_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.EXPO_PUBLIC_OMDB_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_OMDB_API_KEY = originalKey;
    }
  });
}
