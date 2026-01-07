import { NextRequest } from 'next/server';
import { proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates/assign', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success) {
        const dataObj = data.data as { referral_id?: string } | undefined;
        return {
          success: true,
          message: data.message || 'Affiliate assigned to business successfully',
          referral_id: dataObj?.referral_id || (data.referral_id as string | undefined),
        };
      }
      return data;
    },
  });
}
