import { NextRequest, NextResponse } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  console.log('[Demo Users API] Request received');
  try {
    const response = await proxyGet(request, '/auth/demo-users', {
      transformResponse: (data: BackendResponse) => {
        console.log('[Demo Users API] Backend response:', JSON.stringify(data, null, 2));
        // Backend returns: { success: true, users: [...] } (TransformInterceptor returns as-is if 'success' exists)
        if (data.success) {
          // Handle different response formats
          // Backend service returns: { success: true, users: [...] }
          // TransformInterceptor returns it as-is since it has 'success'
          const users = (data.users as unknown[]) || (typeof data.data === 'object' && data.data !== null && 'users' in data.data ? (data.data as { users: unknown[] }).users : []) || (Array.isArray(data.data) ? data.data : []);
          console.log('[Demo Users API] Extracted users:', users);
          return {
            success: true,
            users: users,
          };
        }
        return {
          success: false,
          users: [],
          error: data.error || data.message || 'Failed to fetch demo users',
        };
      },
    });
    console.log('[Demo Users API] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[Demo Users API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        users: [],
        error: error instanceof Error ? error.message : 'Failed to fetch demo users',
      },
      { status: 500 }
    );
  }
}
