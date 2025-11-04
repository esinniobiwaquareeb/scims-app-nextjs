import { describe, it, expect } from 'vitest';
import { AppError, handleApiError, Errors } from '@/utils/api-errors';
import { NextResponse } from 'next/server';

describe('API Error Handling', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR', { detail: 'test' });
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.details).toEqual({ detail: 'test' });
  });

  it('should handle AppError instances correctly', async () => {
    const error = new AppError('Test error', 404, 'NOT_FOUND');
    const response = handleApiError(error, 'test-context');
    
    expect(response).toBeInstanceOf(NextResponse);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Test error');
    expect(body.code).toBe('NOT_FOUND');
  });

  it('should handle Zod validation errors', async () => {
    const zodError = {
      issues: [
        { path: ['name'], message: 'Required' },
        { path: ['email'], message: 'Invalid email' },
      ],
    };
    
    const response = handleApiError(zodError, 'validation');
    const body = await response.json();
    
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toContain('Validation error');
  });

  it('should provide common error instances', () => {
    expect(Errors.UNAUTHORIZED.statusCode).toBe(401);
    expect(Errors.FORBIDDEN.statusCode).toBe(403);
    expect(Errors.NOT_FOUND.statusCode).toBe(404);
    expect(Errors.RATE_LIMIT_EXCEEDED.statusCode).toBe(429);
  });
});

