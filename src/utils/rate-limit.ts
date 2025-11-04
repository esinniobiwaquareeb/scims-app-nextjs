/**
 * Rate limiting utilities
 * Supports both Redis (production) and in-memory (development) rate limiting
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

// In-memory rate limiter for development
class MemoryRateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  async limit(key: string, limit: number, window: number): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      // Create new record
      this.store.set(key, {
        count: 1,
        resetAt: now + window,
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + window,
      };
    }

    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: record.resetAt,
      };
    }

    record.count++;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: record.resetAt,
    };
  }
}

// Create rate limiter instance
let rateLimiter: Ratelimit | MemoryRateLimiter;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  // Production: Use Redis
  try {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    });
  } catch {
    // Fallback to memory if Redis setup fails
    rateLimiter = new MemoryRateLimiter();
  }
} else {
  // Development: Use in-memory
  rateLimiter = new MemoryRateLimiter();
}

/**
 * Rate limit configuration presets
 */
export const RateLimitConfig = {
  // Strict limits for authentication endpoints
  AUTH: {
    limit: 5,
    window: 60 * 1000, // 5 requests per minute
  },
  // Standard API endpoints
  API: {
    limit: 100,
    window: 60 * 1000, // 100 requests per minute
  },
  // Public endpoints
  PUBLIC: {
    limit: 200,
    window: 60 * 1000, // 200 requests per minute
  },
  // Write operations (POST, PUT, DELETE)
  WRITE: {
    limit: 50,
    window: 60 * 1000, // 50 requests per minute
  },
} as const;

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  identifier: string,
  config: { limit: number; window: number } = RateLimitConfig.API
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    if (rateLimiter instanceof Ratelimit) {
      const result = await rateLimiter.limit(identifier);
      return {
        success: result.success,
        limit: config.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } else {
      // Memory rate limiter
      return await rateLimiter.limit(identifier, config.limit, config.window);
    }
  } catch (error) {
    // On error, allow the request (fail open)
    // Use logger instead of console.error
    if (process.env.NODE_ENV === 'development') {
      console.error('Rate limit error:', error);
    }
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Date.now() + config.window,
    };
  }
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent.slice(0, 50)}`;
}

