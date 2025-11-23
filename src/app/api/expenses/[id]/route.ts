import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const updateExpenseSchema = z.object({
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional().nullable(),
  expense_date: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'mobile', 'bank_transfer', 'other']).optional(),
  notes: z.string().optional().nullable(),
});

// GET - Get single expense
export const GET = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  const { data: expense, error } = await supabase
    .from('expense')
    .select(`
      *,
      business:business_id(id, name),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .eq('id', id)
    .single();

  if (error || !expense) {
    throw new AppError('Expense not found', 404, 'NOT_FOUND');
  }

  return successResponse({ expense });
}, { rateLimit: 'API' });

// PATCH - Update expense
export const PATCH = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, updateExpenseSchema);

  const updateData: Record<string, unknown> = {};
  if (body.category) updateData.category = body.category;
  if (body.amount) updateData.amount = body.amount;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.expense_date) updateData.expense_date = body.expense_date;
  if (body.payment_method) updateData.payment_method = body.payment_method;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data: expense, error: updateError } = await supabase
    .from('expense')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      business:business_id(id, name),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .single();

  if (updateError) {
    throw new AppError('Failed to update expense', 500, 'DATABASE_ERROR');
  }

  return successResponse({ expense });
}, { rateLimit: 'WRITE' });

// DELETE - Delete expense
export const DELETE = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  const { error: deleteError } = await supabase
    .from('expense')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new AppError('Failed to delete expense', 500, 'DATABASE_ERROR');
  }

  return successResponse({ message: 'Expense deleted successfully' });
}, { rateLimit: 'WRITE' });

