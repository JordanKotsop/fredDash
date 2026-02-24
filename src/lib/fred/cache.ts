import { LRUCache } from 'lru-cache';
import { FRED_DEFAULTS } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new LRUCache<string, any>({
  max: FRED_DEFAULTS.CACHE_MAX_ENTRIES,
  ttl: FRED_DEFAULTS.CACHE_TTL_MS,
  ttlAutopurge: false,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCache<T>(key: string, value: T): void {
  cache.set(key, value);
}

export function generateCacheKey(
  endpoint: string,
  params: Record<string, string | number | undefined | null>
): string {
  const sorted = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map((k) => `${k}=${String(params[k])}`)
    .join('&');
  return `fred:${endpoint}:${sorted}`;
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: cache.max,
  };
}
