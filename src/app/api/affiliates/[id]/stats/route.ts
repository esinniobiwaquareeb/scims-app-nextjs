import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/affiliates/${id}/stats`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          stats: data.data.stats || data.data,
          referrals: data.data.referrals || [],
          commissions: data.data.commissions || [],
        };
      }
      return data;
    },
  });
}
