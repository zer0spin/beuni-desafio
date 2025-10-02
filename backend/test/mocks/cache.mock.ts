import { vi } from 'vitest';

/**
 * Mock do CacheManager para testes
 */
export const createMockCacheManager = () => {
  const cache = new Map<string, any>();

  return {
    get: vi.fn(async (key: string) => {
      return cache.get(key);
    }),
    set: vi.fn(async (key: string, value: any, ttl?: number) => {
      cache.set(key, value);
      return true;
    }),
    del: vi.fn(async (key: string) => {
      cache.delete(key);
      return true;
    }),
    reset: vi.fn(async () => {
      cache.clear();
      return true;
    }),
    wrap: vi.fn(async (key: string, fn: () => Promise<any>, ttl?: number) => {
      if (cache.has(key)) {
        return cache.get(key);
      }
      const value = await fn();
      cache.set(key, value);
      return value;
    }),
    // Expose the internal cache for testing
    __getInternalCache: () => cache,
  };
};

export type MockCacheManager = ReturnType<typeof createMockCacheManager>;
