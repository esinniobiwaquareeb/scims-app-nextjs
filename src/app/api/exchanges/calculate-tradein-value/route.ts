import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Note: This endpoint may not exist in the backend yet
  // If it doesn't exist, the backend will return 404 and we'll handle it
  return proxyPost(request, '/exchanges/calculate-tradein-value', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { tradeinValue?: number; trade_in_value?: number };
        return {
          success: true,
          tradeinValue: dataObj.tradeinValue || dataObj.trade_in_value || 0,
          message: data.message,
        };
      }
      return data;
    },
  });
}
