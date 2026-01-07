import { NextRequest } from 'next/server';
import { proxyGet, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/sales/aggregated', {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        // Backend returns { success: true, data: { totalSales, totalTransactions, averageTransaction, sales } }
        const aggregatedData = data.data as {
          totalSales?: number;
          totalTransactions?: number;
          averageTransaction?: number;
          sales?: unknown[];
        };
        return {
          success: true,
          sales: Array.isArray(aggregatedData.sales) ? aggregatedData.sales : [],
          totalSales: aggregatedData.totalSales || 0,
          totalTransactions: aggregatedData.totalTransactions || 0,
          averageTransaction: aggregatedData.averageTransaction || 0,
        };
      }
      return {
        success: false,
        sales: [],
        totalSales: 0,
        totalTransactions: 0,
        averageTransaction: 0,
      };
    },
  });
}
