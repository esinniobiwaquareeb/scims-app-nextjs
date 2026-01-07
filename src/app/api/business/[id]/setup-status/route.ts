import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/businesses/${id}/setup-status`, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const dataObj = data.data as { setupStatus?: unknown; completionPercentage?: number; isSetupComplete?: boolean; completedSteps?: unknown[] };
        return {
          success: true,
          setupStatus: dataObj.setupStatus || data.data,
          completionPercentage: dataObj.completionPercentage,
          isSetupComplete: dataObj.isSetupComplete,
          completedSteps: dataObj.completedSteps,
        };
      }
      return data;
    },
  });
}
