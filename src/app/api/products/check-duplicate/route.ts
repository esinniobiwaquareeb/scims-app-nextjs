import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/products/check-duplicate', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          ...data.data,
        };
      }
      return data;
    },
  });
}
