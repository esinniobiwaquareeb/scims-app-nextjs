import { NextRequest } from 'next/server';
import { proxyPost } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/assign', body, {
    transformResponse: (data) => {
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Affiliate assigned to business successfully',
          referral_id: data.data?.referral_id || data.referral_id,
        };
      }
      return data;
    },
  });
}
