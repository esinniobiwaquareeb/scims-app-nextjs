/**
 * Backend API Proxy Utility
 * Proxies requests from Next.js API routes to the NestJS backend
 */

import { NextRequest, NextResponse } from 'next/server';

const getBackendUrl = (): string => {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

/**
 * Extract authorization token from request
 */
function getAuthToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const token = request.cookies.get('scims_auth_token')?.value;
  if (token) {
    return token;
  }

  return null;
}

/**
 * Proxy a request to the backend API
 */
export async function proxyToBackend(
  request: NextRequest,
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    params?: Record<string, string>;
    transformResponse?: (data: any) => any;
  } = {}
): Promise<NextResponse> {
  try {
    const backendUrl = getBackendUrl();
    const { method = 'GET', body, params, transformResponse } = options;

    // Build URL with query parameters
    let url = `${backendUrl}/api${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    } else {
      // Use query params from request if no params provided
      const requestUrl = new URL(request.url);
      const queryString = requestUrl.search;
      if (queryString) {
        url += queryString;
      }
    }

    // Get auth token
    const token = getAuthToken(request);

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make request to backend
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    // Transform response if needed
    const transformedData = transformResponse ? transformResponse(data) : data;

    return NextResponse.json(transformedData, { status: response.status });
  } catch (error) {
    console.error('Backend proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Proxy GET request
 */
export async function proxyGet(
  request: NextRequest,
  endpoint: string,
  options?: {
    transformResponse?: (data: any) => any;
  }
): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * Proxy POST request
 */
export async function proxyPost(
  request: NextRequest,
  endpoint: string,
  body?: any,
  options?: {
    transformResponse?: (data: any) => any;
  }
): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, {
    method: 'POST',
    body,
    ...options,
  });
}

/**
 * Proxy PUT request
 */
export async function proxyPut(
  request: NextRequest,
  endpoint: string,
  body?: any,
  options?: {
    transformResponse?: (data: any) => any;
  }
): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, {
    method: 'PUT',
    body,
    ...options,
  });
}

/**
 * Proxy PATCH request
 */
export async function proxyPatch(
  request: NextRequest,
  endpoint: string,
  body?: any,
  options?: {
    transformResponse?: (data: any) => any;
  }
): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, {
    method: 'PATCH',
    body,
    ...options,
  });
}

/**
 * Proxy DELETE request
 */
export async function proxyDelete(
  request: NextRequest,
  endpoint: string,
  options?: {
    transformResponse?: (data: any) => any;
  }
): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, {
    method: 'DELETE',
    ...options,
  });
}

