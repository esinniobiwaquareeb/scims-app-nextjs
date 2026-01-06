import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Note: This endpoint may not exist in the backend yet
  // If it doesn't exist, the backend will return 404 and we'll handle it
  return proxyPost(request, '/exchanges/validate-return', body, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          isValid: data.data.isValid || false,
          sale: data.data.sale,
          message: data.message || data.data.message,
        };
      }
      return data;
    },
  });
}
