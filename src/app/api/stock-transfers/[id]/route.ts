import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const updateTransferSchema = z.object({
  status: z.enum(['pending', 'in_transit', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

// GET - Get single stock transfer
export const GET = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  const { data: transfer, error } = await supabase
    .from('stock_transfer')
    .select(`
      *,
      product:product_id(id, name, sku, barcode, stock_quantity),
      from_store:from_store_id(id, name),
      to_store:to_store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .eq('id', id)
    .single();

  if (error || !transfer) {
    throw new AppError('Stock transfer not found', 404, 'NOT_FOUND');
  }

  return successResponse({ transfer });
}, { rateLimit: 'API' });

// PATCH - Update stock transfer (mainly for status changes)
export const PATCH = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, updateTransferSchema);

  // Get current transfer
  const { data: currentTransfer, error: fetchError } = await supabase
    .from('stock_transfer')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !currentTransfer) {
    throw new AppError('Stock transfer not found', 404, 'NOT_FOUND');
  }

  // If completing transfer, validate stock availability
  if (body.status === 'completed' && currentTransfer.status !== 'completed') {
    const { data: sourceProduct } = await supabase
      .from('product')
      .select('stock_quantity')
      .eq('id', currentTransfer.product_id)
      .eq('store_id', currentTransfer.from_store_id)
      .single();

    if (!sourceProduct || sourceProduct.stock_quantity < currentTransfer.quantity) {
      throw new AppError(
        'Insufficient stock in source store to complete transfer',
        400,
        'INSUFFICIENT_STOCK'
      );
    }
  }

  // Update transfer
  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data: transfer, error: updateError } = await supabase
    .from('stock_transfer')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      product:product_id(id, name, sku, barcode),
      from_store:from_store_id(id, name),
      to_store:to_store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .single();

  if (updateError) {
    throw new AppError('Failed to update stock transfer', 500, 'DATABASE_ERROR');
  }

  return successResponse({ transfer });
}, { rateLimit: 'WRITE' });

// DELETE - Cancel stock transfer (only if pending)
export const DELETE = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  // Get current transfer
  const { data: currentTransfer, error: fetchError } = await supabase
    .from('stock_transfer')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError || !currentTransfer) {
    throw new AppError('Stock transfer not found', 404, 'NOT_FOUND');
  }

  // Only allow deletion if pending
  if (currentTransfer.status !== 'pending') {
    throw new AppError(
      'Can only delete pending transfers. Cancel completed transfers instead.',
      400,
      'INVALID_STATUS'
    );
  }

  const { error: deleteError } = await supabase
    .from('stock_transfer')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new AppError('Failed to delete stock transfer', 500, 'DATABASE_ERROR');
  }

  return successResponse({ message: 'Stock transfer deleted successfully' });
}, { rateLimit: 'WRITE' });

