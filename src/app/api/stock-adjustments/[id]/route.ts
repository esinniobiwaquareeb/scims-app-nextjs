import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const updateAdjustmentSchema = z.object({
  reason: z.string().min(1).optional(),
  notes: z.string().optional(),
});

// GET - Get single stock adjustment
export const GET = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  const { data: adjustment, error } = await supabase
    .from('stock_adjustment')
    .select(`
      *,
      product:product_id(id, name, sku, barcode, stock_quantity),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .eq('id', id)
    .single();

  if (error || !adjustment) {
    throw new AppError('Stock adjustment not found', 404, 'NOT_FOUND');
  }

  return successResponse({ adjustment });
}, { rateLimit: 'API' });

// PATCH - Update stock adjustment (only reason and notes, not quantity)
export const PATCH = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, updateAdjustmentSchema);

  const updateData: Record<string, unknown> = {};
  if (body.reason) updateData.reason = body.reason;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data: adjustment, error: updateError } = await supabase
    .from('stock_adjustment')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      product:product_id(id, name, sku, barcode),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .single();

  if (updateError) {
    throw new AppError('Failed to update stock adjustment', 500, 'DATABASE_ERROR');
  }

  return successResponse({ adjustment });
}, { rateLimit: 'WRITE' });

// DELETE - Delete stock adjustment (reverse the adjustment)
export const DELETE = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  // Get adjustment details
  const { data: adjustment, error: fetchError } = await supabase
    .from('stock_adjustment')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !adjustment) {
    throw new AppError('Stock adjustment not found', 404, 'NOT_FOUND');
  }

  // Reverse the adjustment by applying opposite quantity change
  // First, get current stock
  const { data: product, error: productError } = await supabase
    .from('product')
    .select('stock_quantity')
    .eq('id', adjustment.product_id)
    .eq('store_id', adjustment.store_id)
    .single();

  if (productError || !product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }

  // Calculate new stock (reverse the adjustment)
  const newStock = Math.max(0, product.stock_quantity - adjustment.quantity_change);

  const { error: reverseError } = await supabase
    .from('product')
    .update({
      stock_quantity: newStock,
    })
    .eq('id', adjustment.product_id)
    .eq('store_id', adjustment.store_id);

  if (reverseError) {
    throw new AppError('Failed to reverse stock adjustment', 500, 'DATABASE_ERROR');
  }

  // Delete the adjustment record
  const { error: deleteError } = await supabase
    .from('stock_adjustment')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new AppError('Failed to delete stock adjustment', 500, 'DATABASE_ERROR');
  }

  return successResponse({ message: 'Stock adjustment deleted and reversed successfully' });
}, { rateLimit: 'WRITE' });

