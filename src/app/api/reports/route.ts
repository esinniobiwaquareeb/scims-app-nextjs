import { NextRequest, NextResponse } from 'next/server';
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
  } else if (type === 'products') {
    endpoint = '/reports/products';
    if (storeId) params.store_id = storeId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
  } else if (type === 'customers') {
    endpoint = '/reports/customers';
    if (storeId) params.store_id = storeId;
  } else if (type === 'stores' || type === 'business' || type === 'store-comparison') {
    // For business/store reports, return sales report filtered by business
    endpoint = '/reports/sales';
    if (storeId) params.store_id = storeId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
  } else if (type === 'discount-effectiveness' || type === 'profit-loss' || type === 'cash-flow' || 
             type === 'staff-performance' || type === 'period-comparison' || type === 'peak-hours' || 
             type === 'returns' || type === 'customer-lifetime-value') {
    // These report types are not yet implemented in backend
    // Return empty data structure to prevent errors
    return NextResponse.json({
      success: true,
      summary: {},
      coupons: [],
      revenue: {},
      cogs: {},
      cashIn: { total: 0, breakdown: [] },
      cashOut: { total: 0, breakdown: [] },
      stores: [],
      staff: [],
      hours: [],
      returns: [],
    });
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
      if (data.success && data.data) {
        // Backend returns { success: true, data: { summary: {...}, sales: [...] } }
        // Frontend expects { success: true, data: { sales: [...] } } or { success: true, sales: [...] }
        const backendData = data.data as Record<string, unknown>;
        
        // For sales report, ensure sales array is at the top level
        if (type === 'sales' || !type || type === 'store-comparison' || type === 'business') {
          return {
            success: true,
            sales: Array.isArray(backendData.sales) ? backendData.sales : [],
            summary: backendData.summary || {},
            revenueData: Array.isArray(backendData.revenueData) ? backendData.revenueData : [],
            categoryData: Array.isArray(backendData.categoryData) ? backendData.categoryData : [],
            paymentData: Array.isArray(backendData.paymentData) ? backendData.paymentData : [],
          };
        }
        
        // For inventory report
        if (type === 'inventory') {
          return {
            success: true,
            summary: backendData.summary || { inStock: 0, lowStock: 0, outOfStock: 0 },
            products: Array.isArray(backendData.products) ? backendData.products : [],
          };
        }
        
        // For financial report
        if (type === 'financial') {
          return {
            success: true,
            summary: backendData.summary || {},
          };
        }
        
        // For products report
        if (type === 'products') {
          return {
            success: true,
            products: Array.isArray(backendData.products) ? backendData.products : [],
          };
        }
        
        // For customers report
        if (type === 'customers') {
          return {
            success: true,
            customers: Array.isArray(backendData.customers) ? backendData.customers : [],
          };
        }
        
        // For other types, return as-is but ensure data structure
        return {
          success: true,
          ...backendData,
        };
      }
      return data;
    },
  });
}
