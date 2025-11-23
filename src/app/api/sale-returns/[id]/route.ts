import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const updateReturnSchema = z.object({
  refund_status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  refund_method: z.enum(['cash', 'card', 'mobile', 'store_credit', 'exchange']).optional(),
  notes: z.string().optional(),
});

// GET - Get single sale return
export const GET = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  const { data: saleReturn, error } = await supabase
    .from('sale_return')
    .select(`
      *,
      sale:sale_id(id, receipt_number, transaction_date, total_amount),
      store:store_id(id, name),
      customer:customer_id(id, name, phone),
      cashier:cashier_id(id, name, username),
      processed_by_user:processed_by(id, name, username),
      return_items:sale_return_item(
        *,
        sale_item:sale_item_id(id, quantity, unit_price),
        product:product_id(id, name, sku)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !saleReturn) {
    throw new AppError('Sale return not found', 404, 'NOT_FOUND');
  }

  return successResponse({ return: saleReturn });
}, { rateLimit: 'API' });

// PATCH - Update sale return (mainly for processing refund)
export const PATCH = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, updateReturnSchema);

  // Get user ID
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AppError('User ID is required', 401, 'UNAUTHORIZED');
  }

  // Get current return
  const { data: currentReturn, error: fetchError } = await supabase
    .from('sale_return')
    .select('refund_status')
    .eq('id', id)
    .single();

  if (fetchError || !currentReturn) {
    throw new AppError('Sale return not found', 404, 'NOT_FOUND');
  }

  // If completing refund, set processed_by and processed_at
  const updateData: Record<string, unknown> = {};
  if (body.refund_status) updateData.refund_status = body.refund_status;
  if (body.refund_method) updateData.refund_method = body.refund_method;
  if (body.notes !== undefined) updateData.notes = body.notes;

  if (body.refund_status === 'completed' && currentReturn.refund_status !== 'completed') {
    updateData.processed_by = userId;
    updateData.processed_at = new Date().toISOString();
    // Trigger will automatically restore stock
  }

  const { data: saleReturn, error: updateError } = await supabase
    .from('sale_return')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      sale:sale_id(id, receipt_number, transaction_date, total_amount),
      store:store_id(id, name),
      customer:customer_id(id, name, phone),
      cashier:cashier_id(id, name, username),
      processed_by_user:processed_by(id, name, username),
      return_items:sale_return_item(
        *,
        sale_item:sale_item_id(id, quantity, unit_price),
        product:product_id(id, name, sku)
      )
    `)
    .single();

  if (updateError) {
    throw new AppError('Failed to update sale return', 500, 'DATABASE_ERROR');
  }

  return successResponse({ return: saleReturn });
}, { rateLimit: 'WRITE' });

