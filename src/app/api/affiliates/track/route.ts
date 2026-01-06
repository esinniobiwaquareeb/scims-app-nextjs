import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/track', body, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          affiliate_code: data.data?.affiliate_code || data.affiliate_code,
          message: data.message || 'Affiliate code is valid',
        };
      }
      return data;
    },
  });
}
