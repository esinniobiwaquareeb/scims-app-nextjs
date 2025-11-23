import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const updateQuotationSchema = z.object({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
  customer_name: z.string().min(1).optional(),
  customer_email: z.string().email().optional().nullable(),
  customer_phone: z.string().optional().nullable(),
  customer_address: z.string().optional().nullable(),
  bank_account_info: z.record(z.string(), z.unknown()).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET - Get single quotation
export const GET = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  const { data: quotation, error } = await supabase
    .from('quotation')
    .select(`
      *,
      business:business_id(id, name),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username),
      items:quotation_item(
        *,
        product:product_id(id, name, sku, price, stock_quantity)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !quotation) {
    throw new AppError('Quotation not found', 404, 'NOT_FOUND');
  }

  return successResponse({ quotation });
}, { rateLimit: 'API' });

// PATCH - Update quotation
export const PATCH = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, updateQuotationSchema);

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.customer_name) updateData.customer_name = body.customer_name;
  if (body.customer_email !== undefined) updateData.customer_email = body.customer_email;
  if (body.customer_phone !== undefined) updateData.customer_phone = body.customer_phone;
  if (body.customer_address !== undefined) updateData.customer_address = body.customer_address;
  if (body.bank_account_info !== undefined) updateData.bank_account_info = body.bank_account_info;
  if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data: quotation, error: updateError } = await supabase
    .from('quotation')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      business:business_id(id, name),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username),
      items:quotation_item(
        *,
        product:product_id(id, name, sku)
      )
    `)
    .single();

  if (updateError) {
    throw new AppError('Failed to update quotation', 500, 'DATABASE_ERROR');
  }

  return successResponse({ quotation });
}, { rateLimit: 'WRITE' });

// DELETE - Delete quotation
export const DELETE = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  // Get quotation status
  const { data: quotation, error: fetchError } = await supabase
    .from('quotation')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError || !quotation) {
    throw new AppError('Quotation not found', 404, 'NOT_FOUND');
  }

  // Only allow deletion of draft or expired quotations
  if (!['draft', 'expired'].includes(quotation.status)) {
    throw new AppError(
      'Can only delete draft or expired quotations',
      400,
      'INVALID_STATUS'
    );
  }

  const { error: deleteError } = await supabase
    .from('quotation')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new AppError('Failed to delete quotation', 500, 'DATABASE_ERROR');
  }

  return successResponse({ message: 'Quotation deleted successfully' });
}, { rateLimit: 'WRITE' });

