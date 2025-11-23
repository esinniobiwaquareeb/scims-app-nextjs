import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const stockTransferSchema = z.object({
  from_store_id: z.string().uuid(),
  to_store_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  transfer_date: z.string().optional(),
  notes: z.string().optional(),
});

// GET - List stock transfers
export const GET = createApiHandler(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const businessId = searchParams.get('business_id');
  const status = searchParams.get('status');

  let query = supabase
    .from('stock_transfer')
    .select(`
      *,
      product:product_id(id, name, sku, barcode),
      from_store:from_store_id(id, name),
      to_store:to_store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .order('transfer_date', { ascending: false });

  if (storeId) {
    query = query.or(`from_store_id.eq.${storeId},to_store_id.eq.${storeId}`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data: transfers, error } = await query;

  if (error) {
    throw new AppError('Failed to fetch stock transfers', 500, 'DATABASE_ERROR');
  }

  return successResponse({ transfers: transfers || [] });
}, { rateLimit: 'API' });

// POST - Create stock transfer
export const POST = createApiHandler(async ({ request }) => {
  const body = await validateRequestBody(request, stockTransferSchema);

  // Validate stores are different
  if (body.from_store_id === body.to_store_id) {
    throw new AppError('Source and destination stores must be different', 400, 'VALIDATION_ERROR');
  }

  // Check if product exists in source store and has enough stock
  const { data: sourceProduct, error: productError } = await supabase
    .from('product')
    .select('stock_quantity, store_id')
    .eq('id', body.product_id)
    .eq('store_id', body.from_store_id)
    .single();

  if (productError || !sourceProduct) {
    throw new AppError('Product not found in source store', 404, 'NOT_FOUND');
  }

  if (sourceProduct.stock_quantity < body.quantity) {
    throw new AppError(
      `Insufficient stock. Available: ${sourceProduct.stock_quantity}, Requested: ${body.quantity}`,
      400,
      'INSUFFICIENT_STOCK'
    );
  }

  // Get user ID from request (should be set by auth middleware)
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AppError('User ID is required', 401, 'UNAUTHORIZED');
  }

  // Create stock transfer
  const transferData = {
    from_store_id: body.from_store_id,
    to_store_id: body.to_store_id,
    product_id: body.product_id,
    quantity: body.quantity,
    transfer_date: body.transfer_date || new Date().toISOString(),
    notes: body.notes || null,
    status: 'pending',
    created_by: userId,
  };

  const { data: transfer, error: transferError } = await supabase
    .from('stock_transfer')
    .insert(transferData)
    .select(`
      *,
      product:product_id(id, name, sku, barcode),
      from_store:from_store_id(id, name),
      to_store:to_store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .single();

  if (transferError) {
    throw new AppError('Failed to create stock transfer', 500, 'DATABASE_ERROR');
  }

  return successResponse({ transfer }, 'Stock transfer created successfully', 201);
}, { rateLimit: 'WRITE' });

