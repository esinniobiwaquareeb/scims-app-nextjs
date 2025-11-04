/**
 * Centralized API error handling
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle API errors with consistent formatting
 */
export function handleApiError(error: unknown, context?: string): NextResponse<ApiError> {
  // Log error for monitoring (in production, this would go to a logging service)
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Log with context for debugging
  if (context) {
    console.error(`[${context}] Error:`, errorMessage);
    if (errorStack && process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', errorStack);
    }
  } else {
    console.error('API Error:', errorMessage);
  }

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && error.details
          ? { details: error.details }
          : {}),
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors (Zod)
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
    const firstIssue = zodError.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: `Validation error: ${firstIssue.message}`,
        code: 'VALIDATION_ERROR',
        ...(process.env.NODE_ENV === 'development'
          ? { details: zodError.issues }
          : {}),
      },
      { status: 400 }
    );
  }

  // Generic error response
  // Never expose internal error details in production
  return NextResponse.json(
    {
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : errorMessage,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      ...(data && { data }),
    },
    { status }
  );
}

/**
 * Common error instances
 */
export const Errors = {
  UNAUTHORIZED: new AppError('Unauthorized', 401, 'UNAUTHORIZED'),
  FORBIDDEN: new AppError('Forbidden', 403, 'FORBIDDEN'),
  NOT_FOUND: new AppError('Resource not found', 404, 'NOT_FOUND'),
  VALIDATION_ERROR: (message: string) => new AppError(message, 400, 'VALIDATION_ERROR'),
  RATE_LIMIT_EXCEEDED: new AppError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED'),
} as const;

