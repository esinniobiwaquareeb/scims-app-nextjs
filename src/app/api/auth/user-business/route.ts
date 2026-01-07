/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch user's business and store information
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return proxyGet(request, '/auth/user-business', {
      transformResponse: () => ({
        success: false,
        error: 'User ID is required',
      }),
    });
  }

  // Note: This endpoint might need to be created in the backend
  // For now, we'll proxy to a similar endpoint or handle it differently
  // The backend might have a different endpoint structure
  return proxyGet(request, `/users/${userId}/business`, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        // Transform backend response to match frontend expectations
        const dataObj = data.data as { business?: unknown; store?: unknown; allStores?: unknown[] };
        return {
          success: true,
          data: {
            business: dataObj.business,
            store: dataObj.store || null,
            allStores: dataObj.allStores || [],
          },
        };
      }
      return data;
    },
  });
}
