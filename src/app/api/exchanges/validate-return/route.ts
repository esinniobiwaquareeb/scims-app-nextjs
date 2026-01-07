import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Note: This endpoint may not exist in the backend yet
  // If it doesn't exist, the backend will return 404 and we'll handle it
  return proxyPost(request, '/exchanges/validate-return', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { isValid?: boolean; sale?: unknown; message?: string };
        return {
          success: true,
          isValid: dataObj.isValid || false,
          sale: dataObj.sale,
          message: data.message || dataObj.message,
        };
      }
      return data;
    },
  });
}
