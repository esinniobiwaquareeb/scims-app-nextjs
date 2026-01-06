import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/brands', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          brands: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/brands', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          brand: data.data,
        };
      }
      return data;
    },
  });
}
