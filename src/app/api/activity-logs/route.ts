import { NextRequest } from 'next/server';
import { proxyGet, proxyDelete, BackendResponse } from '@/utils/backend-proxy';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const storeId = searchParams.get('store_id');
  const userId = searchParams.get('user_id');
  const userRole = searchParams.get('user_role');
  const activityType = searchParams.get('activity_type');
  const category = searchParams.get('category');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const params: Record<string, string> = {};
  if (businessId) params.business_id = businessId;
  if (storeId) params.store_id = storeId;
  if (userId) params.user_id = userId;
  if (userRole) params.user_role = userRole;
  if (activityType) params.activity_type = activityType;
  if (category) params.category = category;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  return proxyGet(request, '/activity-logs', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          logs: Array.isArray(data.data) ? data.data : [],
          total: data.total || 0,
          pagination: data.pagination || {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
          },
        };
      }
      return data;
    },
  });
}

export async function DELETE(request: NextRequest) {
  return proxyDelete(request, '/activity-logs');
}
