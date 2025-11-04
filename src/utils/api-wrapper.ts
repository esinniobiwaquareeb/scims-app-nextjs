/**
 * API route wrapper utilities
 * Provides consistent middleware for rate limiting, error handling, and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier, RateLimitConfig } from './rate-limit';
import { handleApiError, Errors } from './api-errors';
import { logger } from './logger';

export interface ApiHandlerContext {
  request: NextRequest;
  params?: Record<string, string>;
}

export type ApiHandler = (context: ApiHandlerContext) => Promise<NextResponse>;

export interface ApiRouteOptions {
  rateLimit?: keyof typeof RateLimitConfig;
  requireAuth?: boolean;
}

/**
 * Wrap API route handlers with rate limiting and error handling
 */
export function createApiHandler(
  handler: ApiHandler,
  options: ApiRouteOptions = {}
) {
  return async (request: NextRequest, context?: { params?: Promise<Record<string, string>> | Record<string, string> }) => {
    const startTime = Date.now();
    const pathname = request.url;
    
    try {
      // Rate limiting
      if (options.rateLimit) {
        const identifier = getRateLimitIdentifier(request);
        const rateLimitResult = await checkRateLimit(
          `${pathname}:${identifier}`,
          RateLimitConfig[options.rateLimit]
        );

        if (!rateLimitResult.success) {
          logger.warn('Rate limit exceeded', { pathname, identifier });
          return NextResponse.json(
            {
              success: false,
              error: 'Rate limit exceeded. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
                'X-RateLimit-Limit': String(rateLimitResult.limit),
                'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                'X-RateLimit-Reset': String(rateLimitResult.reset),
              },
            }
          );
        }
      }

      // Resolve params if it's a Promise
      const resolvedParams = context?.params instanceof Promise 
        ? await context.params 
        : context?.params;

      // Execute handler
      const response = await handler({
        request,
        params: resolvedParams,
      });

      // Log successful request
      const duration = Date.now() - startTime;
      logger.debug('API request completed', {
        pathname,
        method: request.method,
        status: response.status,
        duration: `${duration}ms`,
      });

      return response;
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      logger.error('API request failed', {
        pathname,
        method: request.method,
        duration: `${duration}ms`,
      }, error instanceof Error ? error : new Error(String(error)));

      // Handle error
      return handleApiError(error, pathname);
    }
  };
}

