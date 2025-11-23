import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const expenseSchema = z.object({
  business_id: z.string().uuid(),
  store_id: z.string().uuid().optional().nullable(),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional().nullable(),
  expense_date: z.string().optional(),
  payment_method: z.enum(['cash', 'card', 'mobile', 'bank_transfer', 'other']).default('cash'),
  notes: z.string().optional().nullable(),
});

// GET - List expenses
export const GET = createApiHandler(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const storeId = searchParams.get('store_id');
  const category = searchParams.get('category');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  let query = supabase
    .from('expense')
    .select(`
      *,
      business:business_id(id, name),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .order('expense_date', { ascending: false });

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (startDate) {
    query = query.gte('expense_date', startDate);
  }

  if (endDate) {
    query = query.lte('expense_date', endDate);
  }

  const { data: expenses, error } = await query;

  if (error) {
    throw new AppError('Failed to fetch expenses', 500, 'DATABASE_ERROR');
  }

  return successResponse({ expenses: expenses || [] });
}, { rateLimit: 'API' });

// POST - Create expense
export const POST = createApiHandler(async ({ request }) => {
  const body = await validateRequestBody(request, expenseSchema);

  // Get user ID
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AppError('User ID is required', 401, 'UNAUTHORIZED');
  }

  const expenseData = {
    business_id: body.business_id,
    store_id: body.store_id || null,
    category: body.category,
    amount: body.amount,
    description: body.description || null,
    expense_date: body.expense_date || new Date().toISOString(),
    payment_method: body.payment_method,
    notes: body.notes || null,
    created_by: userId,
  };

  const { data: expense, error: expenseError } = await supabase
    .from('expense')
    .insert(expenseData)
    .select(`
      *,
      business:business_id(id, name),
      store:store_id(id, name),
      created_by_user:created_by(id, name, username)
    `)
    .single();

  if (expenseError) {
    throw new AppError('Failed to create expense', 500, 'DATABASE_ERROR');
  }

    return successResponse({ expense }, 'Created', 201);
}, { rateLimit: 'WRITE' });

