import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/affiliates/${id}/stats`, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { stats?: unknown; referrals?: unknown[]; commissions?: unknown[] };
        return {
          success: true,
          stats: dataObj.stats || data.data,
          referrals: dataObj.referrals || [],
          commissions: dataObj.commissions || [],
        };
      }
      return data;
    },
  });
}
