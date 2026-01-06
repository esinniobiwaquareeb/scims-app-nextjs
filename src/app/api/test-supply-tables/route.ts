import { NextRequest } from 'next/server';
import { proxyGet } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  // Note: This is a test endpoint, may not exist in backend
  // If it doesn't exist, return a simple response
  try {
    return proxyGet(request, '/test/supply-tables');
  } catch (error) {
    // If backend doesn't have this endpoint, return a simple test response
    return Response.json({
      success: true,
      message: 'Test endpoint - supply tables check not implemented in backend yet',
    });
  }
}
