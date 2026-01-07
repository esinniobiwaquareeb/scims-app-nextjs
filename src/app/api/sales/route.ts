import { NextRequest } from 'next/server';
import { proxyGet, proxyPost, BackendResponse } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const businessId = searchParams.get('business_id');
  const status = searchParams.get('status');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const includeSupplyOrders = searchParams.get('include_supply_orders');

  const params: Record<string, string> = {};
  if (storeId) params.store_id = storeId;
  if (businessId) params.business_id = businessId;
  if (status) params.status = status;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (includeSupplyOrders) params.include_supply_orders = includeSupplyOrders;

  return proxyGet(request, '/sales', {
    params,
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        const paginationData = (data as { pagination?: { page?: number; limit?: number; total?: number } }).pagination;
        const page = paginationData?.page || 1;
        const limit = paginationData?.limit || 10;
        const total = paginationData?.total || 0;
        return {
          success: true,
          sales: Array.isArray(data.data) ? data.data : [],
          pagination: {
            total: total || 0,
            page: page || 1,
            limit: limit || 10,
            offset: ((page || 1) - 1) * (limit || 10),
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Transform request body to match backend DTO
  // Backend calculates: receipt_number, subtotal, tax_amount, total_amount, status
  // Backend expects: tax_rate (percentage) instead of tax_amount
  const transformedBody: {
    store_id: string;
    business_id?: string;
    customer_id?: string;
    cashier_id?: string;
    transaction_date?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      discount_amount?: number;
    }>;
    tax_rate?: number;
    delivery_cost?: number;
    notes?: string;
    payment_method?: string;
  } = {
    store_id: body.store_id,
    items: (body.items || []).map((item: {
      product_id: string;
      quantity: number;
      unit_price: string | number;
      discount_amount?: number;
      total_price?: number;
    }) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price,
      discount_amount: item.discount_amount || 0,
    })),
  };

  // Only include optional fields if they have values (not empty strings or null)
  if (body.business_id) transformedBody.business_id = body.business_id;
  if (body.customer_id) transformedBody.customer_id = body.customer_id;
  if (body.cashier_id) transformedBody.cashier_id = body.cashier_id;
  if (body.transaction_date) transformedBody.transaction_date = body.transaction_date;
  if (body.delivery_cost !== undefined) transformedBody.delivery_cost = body.delivery_cost || 0;
  if (body.notes) transformedBody.notes = body.notes;
  if (body.payment_method) transformedBody.payment_method = body.payment_method;

  // Calculate tax_rate from tax_amount and subtotal if provided
  if (body.tax_amount && body.subtotal && body.subtotal > 0) {
    transformedBody.tax_rate = (body.tax_amount / body.subtotal) * 100;
  } else if (body.tax_rate !== undefined) {
    transformedBody.tax_rate = body.tax_rate;
  }

  return proxyPost(request, '/sales', transformedBody, {
    transformResponse: (data: BackendResponse) => {
      if (data.success && data.data) {
        return {
          success: true,
          sale: data.data,
        };
      }
      return data;
    },
  });
}
