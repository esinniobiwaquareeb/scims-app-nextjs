import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/exchanges', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          transactions: Array.isArray(data.data) ? data.data : [],
          pagination: {
            limit: 50,
            offset: 0,
            total: data.total || (Array.isArray(data.data) ? data.data.length : 0),
          },
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Transform the request body to match backend DTO
  const backendBody = {
    store_id: body.store_id,
    customer_id: body.customer_id,
    transaction_type: body.transaction_type,
    original_sale_id: body.original_sale_id,
    additional_payment: body.additional_payment || 0,
    notes: body.notes,
    items: body.exchange_items?.map((item: {
      item_type: string;
      original_sale_item_id?: string;
      product_id: string;
      product_name?: string;
      product_sku?: string;
      product_barcode?: string;
      quantity: number;
      unit_value: number;
      condition?: string;
      condition_notes?: string;
      add_to_inventory?: boolean;
    }) => ({
      item_type: item.item_type,
      original_sale_item_id: item.original_sale_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_barcode: item.product_barcode,
      quantity: item.quantity,
      unit_value: item.unit_value,
      condition: item.condition,
      condition_notes: item.condition_notes,
      add_to_inventory: item.add_to_inventory !== false,
    })) || [],
    purchase_items: body.purchase_items?.map((item: {
      product_id: string;
      quantity: number;
      unit_price: number;
      discount_amount?: number;
    }) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount || 0,
    })) || [],
  };

  return proxyPost(request, '/exchanges', backendBody, {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          transaction: data.data,
          message: data.message || 'Exchange transaction created successfully',
        };
      }
      return data;
    },
  });
}
