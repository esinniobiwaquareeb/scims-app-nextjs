import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const stockAdjustmentSchema = z.object({
  store_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity_change: z.number().int().refine(val => val !== 0, {
    message: 'Quantity change cannot be zero',
  }),
  reason: z.string().min(1),
  adjustment_date: z.string().optional(),
  notes: z.string().optional(),
});

// GET - List stock adjustments
export const GET = createApiHandler(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const productId = searchParams.get('product_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  let query = supabase
    .from('stock_adjustment')
    .select(`
      *,
      product:product_id(id, name, sku, barcode),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .order('adjustment_date', { ascending: false });

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  if (productId) {
    query = query.eq('product_id', productId);
  }

  if (startDate) {
    query = query.gte('adjustment_date', startDate);
  }

  if (endDate) {
    query = query.lte('adjustment_date', endDate);
  }

  const { data: adjustments, error } = await query;

  if (error) {
    throw new AppError('Failed to fetch stock adjustments', 500, 'DATABASE_ERROR');
  }

  return successResponse({ adjustments: adjustments || [] });
}, { rateLimit: 'API' });

// POST - Create stock adjustment
export const POST = createApiHandler(async ({ request }) => {
  const body = await validateRequestBody(request, stockAdjustmentSchema);

  // Get user ID from request
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AppError('User ID is required', 401, 'UNAUTHORIZED');
  }

  // Verify product exists in store
  const { data: product, error: productError } = await supabase
    .from('product')
    .select('id, stock_quantity')
    .eq('id', body.product_id)
    .eq('store_id', body.store_id)
    .single();

  if (productError || !product) {
    throw new AppError('Product not found in store', 404, 'NOT_FOUND');
  }

  // Create adjustment (trigger will automatically update stock)
  const adjustmentData = {
    store_id: body.store_id,
    product_id: body.product_id,
    quantity_change: body.quantity_change,
    reason: body.reason,
    adjustment_date: body.adjustment_date || new Date().toISOString(),
    notes: body.notes || null,
    created_by: userId,
  };

  const { data: adjustment, error: adjustmentError } = await supabase
    .from('stock_adjustment')
    .insert(adjustmentData)
    .select(`
      *,
      product:product_id(id, name, sku, barcode, stock_quantity),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .single();

  if (adjustmentError) {
    throw new AppError('Failed to create stock adjustment', 500, 'DATABASE_ERROR');
  }

  return successResponse({ adjustment }, 'Stock adjustment created successfully', 201);
}, { rateLimit: 'WRITE' });

