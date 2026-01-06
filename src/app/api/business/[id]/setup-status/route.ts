import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, `/businesses/${id}/setup-status`, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          setupStatus: data.data.setupStatus || data.data,
          completionPercentage: data.data.completionPercentage,
          isSetupComplete: data.data.isSetupComplete,
          completedSteps: data.data.completedSteps,
        };
      }
      return data;
    },
  });
}
