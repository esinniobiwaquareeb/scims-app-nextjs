// Error handling utilities

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export class CustomError extends Error {
  public code: string;
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
} as const;

export const createError = (
  message: string,
  code: keyof typeof ErrorCodes = 'INTERNAL_ERROR',
  statusCode: number = 500,
  details?: unknown
): CustomError => {
  return new CustomError(message, ErrorCodes[code], statusCode, details);
};

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof CustomError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error && typeof error === 'object' && 'response' in error) {
    // API response error
    const responseError = error as { response: { status: number; data?: { code?: string; message?: string } }; message?: string };
    const { status, data } = responseError.response;
    return {
      code: data?.code || 'API_ERROR',
      message: data?.message || responseError.message || 'An API error occurred',
      statusCode: status,
      details: data,
    };
  }

  if (error && typeof error === 'object' && 'request' in error) {
    // Network error
    const networkError = error as { request: unknown };
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Network error. Please check your connection.',
      statusCode: 0,
      details: networkError.request,
    };
  }

  // Generic error
  const genericError = error as { message?: string };
  return {
    code: ErrorCodes.INTERNAL_ERROR,
    message: genericError.message || 'An unexpected error occurred',
    statusCode: 500,
    details: error,
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }

  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const errorObj = error as { code?: string; statusCode?: number; message?: string };
    return errorObj.code === ErrorCodes.NETWORK_ERROR || 
           errorObj.statusCode === 0 ||
           errorObj.message?.includes('Network Error') === true;
  }
  return false;
};

export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const errorObj = error as { code?: string; statusCode?: number };
    return errorObj.code === ErrorCodes.UNAUTHORIZED || 
           errorObj.code === ErrorCodes.FORBIDDEN ||
           errorObj.code === ErrorCodes.TOKEN_EXPIRED ||
           errorObj.statusCode === 401 ||
           errorObj.statusCode === 403;
  }
  return false;
};

export const isValidationError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const errorObj = error as { code?: string; statusCode?: number };
    return errorObj.code === ErrorCodes.VALIDATION_ERROR || 
           errorObj.code === ErrorCodes.INVALID_INPUT ||
           errorObj.statusCode === 400;
  }
  return false;
};

export const isNotFoundError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const errorObj = error as { code?: string; statusCode?: number };
    return errorObj.code === ErrorCodes.NOT_FOUND || 
           errorObj.statusCode === 404;
  }
  return false;
};
