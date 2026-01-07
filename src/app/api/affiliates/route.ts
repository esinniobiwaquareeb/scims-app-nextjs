import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const applicationStatus = searchParams.get('application_status');
  const search = searchParams.get('search');

  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (applicationStatus) params.application_status = applicationStatus;
  if (search) params.search = search;

  return proxyGet(request, '/affiliates', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { affiliates?: unknown[] } | unknown[];
        return {
          success: true,
          affiliates: Array.isArray(dataObj) ? dataObj : (dataObj.affiliates || []),
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/affiliates', body, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          affiliate: data.data,
          message: data.message || 'Affiliate created successfully',
        };
      }
      return data;
    },
  });
}
