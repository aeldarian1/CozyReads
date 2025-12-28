/**
 * Rate limiting utility for API routes.
 * Uses in-memory LRU cache to track request counts per identifier.
 *
 * Features:
 * - Configurable rate limits
 * - Multiple time windows (per second, minute, hour)
 * - Automatic cleanup of old entries
 * - Support for different identifiers (IP, user ID, API key)
 *
 * @example
 * import { checkRateLimit } from '@/lib/rate-limit';
 *
 * export async function POST(request: Request) {
 *   const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
 *   const rateLimit = checkRateLimit(clientIp, { limit: 10, window: 60000 });
 *
 *   if (!rateLimit.success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests', retryAfter: rateLimit.resetAt },
 *       { status: 429, headers: { 'Retry-After': String(rateLimit.resetAt) } }
 *     );
 *   }
 *
 *   // Process request...
 * }
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window.
   * Default: 10
   */
  limit?: number;

  /**
   * Time window in milliseconds.
   * Default: 60000 (1 minute)
   */
  window?: number;

  /**
   * Optional custom identifier (defaults to IP address).
   */
  identifier?: string;
}

interface RateLimitResult {
  /** Whether the request should be allowed */
  success: boolean;

  /** Number of requests remaining in the current window */
  remaining: number;

  /** Total limit for this window */
  limit: number;

  /** Timestamp when the rate limit resets (Unix timestamp in seconds) */
  resetAt: number;

  /** Current request count */
  count: number;
}

// In-memory cache for rate limit tracking
// In production, use Redis or similar for distributed rate limiting
const rateLimitCache = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited.
 *
 * @param identifier - Unique identifier for the requester (IP, user ID, etc.)
 * @param options - Rate limit configuration
 * @returns Rate limit result with success flag and metadata
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { limit = 10, window = 60000 } = options;
  const now = Date.now();
  const key = `${identifier}:${window}`;

  // Get existing entry or create new one
  let entry = rateLimitCache.get(key);

  if (!entry || now > entry.resetAt) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetAt: now + window,
    };
    rateLimitCache.set(key, entry);

    return {
      success: true,
      remaining: limit - 1,
      limit,
      resetAt: Math.floor(entry.resetAt / 1000),
      count: 1,
    };
  }

  // Increment count
  entry.count++;

  if (entry.count > limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      limit,
      resetAt: Math.floor(entry.resetAt / 1000),
      count: entry.count,
    };
  }

  // Within limit
  return {
    success: true,
    remaining: limit - entry.count,
    limit,
    resetAt: Math.floor(entry.resetAt / 1000),
    count: entry.count,
  };
}

/**
 * Multi-tier rate limiting with different windows.
 * Useful for protecting against both burst attacks and sustained abuse.
 *
 * @example
 * const result = checkMultiTierRateLimit('user-123', [
 *   { limit: 10, window: 1000 },     // 10 per second
 *   { limit: 100, window: 60000 },   // 100 per minute
 *   { limit: 1000, window: 3600000 } // 1000 per hour
 * ]);
 */
export function checkMultiTierRateLimit(
  identifier: string,
  tiers: Array<{ limit: number; window: number }>
): RateLimitResult {
  for (const tier of tiers) {
    const result = checkRateLimit(identifier, tier);
    if (!result.success) {
      return result;
    }
  }

  // All tiers passed
  const firstTier = tiers[0];
  return checkRateLimit(identifier, firstTier);
}

/**
 * Cleanup old entries from the cache.
 * Should be called periodically to prevent memory leaks.
 */
export function cleanupRateLimitCache(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitCache.entries()) {
    if (now > entry.resetAt) {
      rateLimitCache.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Clear all rate limit entries for a specific identifier.
 * Useful for testing or after successful authentication.
 */
export function clearRateLimit(identifier: string): void {
  for (const key of rateLimitCache.keys()) {
    if (key.startsWith(identifier)) {
      rateLimitCache.delete(key);
    }
  }
}

/**
 * Get current rate limit status without incrementing the counter.
 * Useful for checking status before processing a request.
 */
export function getRateLimitStatus(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { limit = 10, window = 60000 } = options;
  const now = Date.now();
  const key = `${identifier}:${window}`;

  const entry = rateLimitCache.get(key);

  if (!entry || now > entry.resetAt) {
    return {
      success: true,
      remaining: limit,
      limit,
      resetAt: Math.floor((now + window) / 1000),
      count: 0,
    };
  }

  return {
    success: entry.count < limit,
    remaining: Math.max(0, limit - entry.count),
    limit,
    resetAt: Math.floor(entry.resetAt / 1000),
    count: entry.count,
  };
}

/**
 * Predefined rate limit configurations for common use cases.
 */
export const RateLimitPresets = {
  /** Very strict: 5 requests per minute */
  strict: { limit: 5, window: 60000 },

  /** Standard API: 60 requests per minute */
  standard: { limit: 60, window: 60000 },

  /** Generous: 120 requests per minute */
  generous: { limit: 120, window: 60000 },

  /** Authentication: 5 login attempts per 15 minutes */
  auth: { limit: 5, window: 15 * 60 * 1000 },

  /** Search: 30 requests per minute */
  search: { limit: 30, window: 60000 },

  /** File upload: 10 uploads per hour */
  upload: { limit: 10, window: 60 * 60 * 1000 },

  /** Multi-tier for critical endpoints */
  critical: [
    { limit: 10, window: 1000 },        // 10 per second
    { limit: 100, window: 60000 },      // 100 per minute
    { limit: 1000, window: 3600000 },   // 1000 per hour
  ],
};

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanupRateLimitCache();
    if (cleaned > 0) {
      console.log(`[Rate Limit] Cleaned ${cleaned} expired entries`);
    }
  }, 5 * 60 * 1000);
}

/**
 * Helper to extract client IP from Next.js request.
 */
export function getClientIp(request: Request): string {
  // Check common headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Middleware helper for easy rate limiting in API routes.
 */
export async function withRateLimit<T>(
  request: Request,
  options: RateLimitOptions,
  handler: () => Promise<T>
): Promise<T | { error: string; status: number; headers: Record<string, string> }> {
  const identifier = options.identifier || getClientIp(request);
  const result = checkRateLimit(identifier, options);

  if (!result.success) {
    return {
      error: 'Too many requests. Please try again later.',
      status: 429,
      headers: {
        'Retry-After': String(result.resetAt),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    };
  }

  return handler();
}
