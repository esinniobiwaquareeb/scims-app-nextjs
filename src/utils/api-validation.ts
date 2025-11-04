/**
 * API request validation utilities using Zod
 */

import { z } from 'zod';
import { NextRequest } from 'next/server';
import { handleApiError, AppError } from './api-errors';

/**
 * Parse and validate JSON body with Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        `Validation error: ${error.issues.map(e => `${e.path.map(String).join('.')}: ${e.message}`).join(', ')}`,
        400,
        'VALIDATION_ERROR',
        error.issues
      );
    }
    throw new AppError('Invalid request body', 400, 'INVALID_BODY');
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): T {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  
  try {
    const validated = schema.parse(params);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        `Invalid query parameters: ${error.issues.map(e => `${e.path.map(String).join('.')}: ${e.message}`).join(', ')}`,
        400,
        'VALIDATION_ERROR',
        error.issues
      );
    }
    throw new AppError('Invalid query parameters', 400, 'INVALID_QUERY');
  }
}

/**
 * Validate path parameters with Zod schema
 */
export function validatePathParams<T>(
  params: Promise<Record<string, string>> | Record<string, string>,
  schema: z.ZodSchema<T>
): Promise<T> | T {
  const validate = (p: Record<string, string>): T => {
    try {
      const validated = schema.parse(p);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(
          `Invalid path parameters: ${error.issues.map(e => `${e.path.map(String).join('.')}: ${e.message}`).join(', ')}`,
          400,
          'VALIDATION_ERROR',
          error.issues
        );
      }
      throw new AppError('Invalid path parameters', 400, 'INVALID_PATH');
    }
  };

  if (params instanceof Promise) {
    return params.then(validate);
  }
  return validate(params);
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  uuidOptional: z.string().uuid().optional(),
  email: z.string().email('Invalid email format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().nonnegative('Must be a non-negative number'),
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  }),
} as const;

