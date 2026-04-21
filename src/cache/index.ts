import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── Cache keys ──────────────────────────────────────────────
export const CACHE_KEYS = {
  /** Per-user sync flag: `user-synced:<userId>` */
  userSynced: (userId: string) => `user-synced:${userId}`,
  /** Category service counts for the homepage */
  categoryCounts: "category-counts",
  /** Featured pros list on the homepage */
  featuredPros: "featured-pros",
  /** Services directory query: `services:<category>:<query>` */
  servicesQuery: (category: string, query: string) =>
    `services:${category || "all"}:${query || ""}`,
  /** Single service detail: `service-details:<id>` */
  serviceDetails: (id: string | number) => `service-details:${id}`,
  /** Customer profile defaults (phone, location): `customer-profile:<userId>` */
  customerProfile: (userId: string) => `customer-profile:${userId}`,
  /** Pro dashboard bookings: `pro-bookings:<userId>` */
  proBookings: (userId: string) => `pro-bookings:${userId}`,
  /** Customer dashboard bookings: `customer-bookings:<userId>` */
  customerBookings: (userId: string) => `customer-bookings:${userId}`,
  /** Pro dashboard services: `pro-services:<userId>` */
  proServices: (userId: string) => `pro-services:${userId}`,
} as const;

// ── TTLs (in seconds) ──────────────────────────────────────
export const TTL = {
  userSynced: 15 * 60,    // 15 minutes
  categoryCounts: 5 * 60, // 5 minutes
  featuredPros: 3 * 60,   // 3 minutes
  servicesQuery: 2 * 60,  // 2 minutes
  serviceDetails: 2 * 60, // 2 minutes
  customerProfile: 30 * 24 * 60 * 60, // 30 days
  proBookings: 60,       // 1 minute
  customerBookings: 60,  // 1 minute
  proServices: 2 * 60,   // 2 minutes
} as const;

// ── Helpers ─────────────────────────────────────────────────

/**
 * Get a cached value. Returns `null` on miss or Redis error (fail-open).
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key);
    return cached ?? null;
  } catch (err) {
    console.warn("[cache] GET failed, skipping cache:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Set a cached value with TTL. Silently fails on Redis error (fail-open).
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn("[cache] SET failed, skipping cache:", err instanceof Error ? err.message : err);
  }
}

/**
 * Delete one or more cache keys. Used for invalidation after writes.
 */
export async function cacheInvalidate(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn("[cache] DEL failed:", err instanceof Error ? err.message : err);
  }
}

export default redis;