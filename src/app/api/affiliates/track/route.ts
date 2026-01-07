import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/track', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success) {
        const dataObj = data.data as { affiliate_code?: string } | undefined;
        return {
          success: true,
          affiliate_code: dataObj?.affiliate_code || (data.affiliate_code as string | undefined),
          message: data.message || 'Affiliate code is valid',
        };
      }
      return data;
    },
  });
}
