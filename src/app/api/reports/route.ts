import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const storeId = searchParams.get('store_id');
  const businessId = searchParams.get('business_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  // Map frontend report types to backend endpoints
  let endpoint = '/reports';
  const params: Record<string, string> = {};

  if (type === 'sales' || type === 'financial') {
    endpoint = `/reports/${type}`;
    if (storeId) params.store_id = storeId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
  } else if (type === 'inventory') {
    endpoint = '/reports/inventory';
    if (storeId) params.store_id = storeId;
  } else if (type === 'stores' || type === 'business' || type === 'store-comparison') {
    // For business/store reports, return sales report filtered by business
    endpoint = '/reports/sales';
    if (storeId) params.store_id = storeId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
  } else {
    // Default to sales report
    endpoint = '/reports/sales';
    if (storeId) params.store_id = storeId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
  }

  return proxyGet(request, endpoint, {
    params,
    transformResponse: (data: BackendResponse) => {
      return data;
    },
  });
}
