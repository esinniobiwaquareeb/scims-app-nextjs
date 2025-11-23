import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const quotationSchema = z.object({
  business_id: z.string().uuid(),
  store_id: z.string().uuid().optional().nullable(),
  customer_name: z.string().min(1),
  customer_email: z.string().email().optional().nullable(),
  customer_phone: z.string().optional().nullable(),
  customer_address: z.string().optional().nullable(),
  items: z.array(z.object({
    product_id: z.string().uuid().optional().nullable(),
    item_name: z.string().min(1),
    description: z.string().optional().nullable(),
    quantity: z.number().int().positive(),
    unit_price: z.number().nonnegative(),
    is_custom_item: z.boolean().default(false),
  })),
  tax_amount: z.number().nonnegative().default(0),
  discount_amount: z.number().nonnegative().default(0),
  bank_account_info: z.record(z.string(), z.unknown()).optional().nullable(),
  expires_at: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET - List quotations
export const GET = createApiHandler(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const storeId = searchParams.get('store_id');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let query = supabase
    .from('quotation')
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
    .order('created_at', { ascending: false });

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`quotation_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
  }

  const { data: quotations, error } = await query;

  if (error) {
    throw new AppError('Failed to fetch quotations', 500, 'DATABASE_ERROR');
  }

  return successResponse({ quotations: quotations || [] });
}, { rateLimit: 'API' });

// POST - Create quotation
export const POST = createApiHandler(async ({ request }) => {
  const body = await validateRequestBody(request, quotationSchema);

  // Get user ID
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AppError('User ID is required', 401, 'UNAUTHORIZED');
  }

  // Calculate totals
  const subtotal = body.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalAmount = subtotal + body.tax_amount - body.discount_amount;

  // Generate quotation number
  const quotationNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create quotation
  const quotationData = {
    business_id: body.business_id,
    store_id: body.store_id || null,
    quotation_number: quotationNumber,
    customer_name: body.customer_name,
    customer_email: body.customer_email || null,
    customer_phone: body.customer_phone || null,
    customer_address: body.customer_address || null,
    subtotal,
    tax_amount: body.tax_amount,
    discount_amount: body.discount_amount,
    total_amount: totalAmount,
    bank_account_info: body.bank_account_info || null,
    status: 'draft',
    expires_at: body.expires_at || null,
    notes: body.notes || null,
    created_by: userId,
  };

  const { data: quotation, error: quotationError } = await supabase
    .from('quotation')
    .insert(quotationData)
    .select()
    .single();

  if (quotationError) {
    throw new AppError('Failed to create quotation', 500, 'DATABASE_ERROR');
  }

  // Create quotation items
  const quotationItems = body.items.map(item => ({
    quotation_id: quotation.id,
    product_id: item.product_id || null,
    item_name: item.item_name,
    description: item.description || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price,
    is_custom_item: item.is_custom_item,
  }));

  const { error: itemsError } = await supabase
    .from('quotation_item')
    .insert(quotationItems);

  if (itemsError) {
    // Rollback quotation creation
    await supabase.from('quotation').delete().eq('id', quotation.id);
    throw new AppError('Failed to create quotation items', 500, 'DATABASE_ERROR');
  }

  // Fetch complete quotation with relations
  const { data: completeQuotation } = await supabase
    .from('quotation')
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
    .eq('id', quotation.id)
    .single();

  return successResponse({ quotation: completeQuotation }, 'Quotation created successfully', 201);
}, { rateLimit: 'WRITE' });

