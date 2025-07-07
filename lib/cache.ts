import { LRUCache } from 'lru-cache';
import type { Tenant } from './db/schema';

// Create tenant cache with 10-minute TTL
const tenantCache = new LRUCache<string, Tenant>({
  max: 100, // Maximum 100 tenants in cache
  ttl: 1000 * 60 * 10, // 10 minutes
});

export async function getCachedTenantBySlug(
  slug: string,
  fetcher: () => Promise<Tenant | null>,
): Promise<Tenant | null> {
  const cacheKey = `tenant:slug:${slug}`;

  // Check cache first
  const cached = tenantCache.get(cacheKey);
  if (cached) return cached;

  // If not in cache, fetch and store
  const tenant = await fetcher();
  if (tenant) {
    tenantCache.set(cacheKey, tenant);
  }

  return tenant;
}

// Similar functions for other tenant lookup patterns
