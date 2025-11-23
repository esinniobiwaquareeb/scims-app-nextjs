import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const saleReturnSchema = z.object({
  sale_id: z.string().uuid(),
  return_items: z.array(z.object({
    sale_item_id: z.string().uuid(),
    product_id: z.string().uuid(),
    quantity_returned: z.number().int().positive(),
    return_reason: z.string().optional(),
  })),
  refund_method: z.enum(['cash', 'card', 'mobile', 'store_credit', 'exchange']).default('cash'),
  return_reason: z.string().optional(),
  notes: z.string().optional(),
});

// GET - List sale returns
export const GET = createApiHandler(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');
  const saleId = searchParams.get('sale_id');
  const refundStatus = searchParams.get('refund_status');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  let query = supabase
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
    .order('return_date', { ascending: false });

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  if (saleId) {
    query = query.eq('sale_id', saleId);
  }

  if (refundStatus) {
    query = query.eq('refund_status', refundStatus);
  }

  if (startDate) {
    query = query.gte('return_date', startDate);
  }

  if (endDate) {
    query = query.lte('return_date', endDate);
  }

  const { data: returns, error } = await query;

  if (error) {
    throw new AppError('Failed to fetch sale returns', 500, 'DATABASE_ERROR');
  }

  return successResponse({ returns: returns || [] });
}, { rateLimit: 'API' });

// POST - Create sale return
export const POST = createApiHandler(async ({ request }) => {
  const body = await validateRequestBody(request, saleReturnSchema);

  // Get user ID from request
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AppError('User ID is required', 401, 'UNAUTHORIZED');
  }

  // Get sale details
  const { data: sale, error: saleError } = await supabase
    .from('sale')
    .select('*, store_id, customer_id')
    .eq('id', body.sale_id)
    .single();

  if (saleError || !sale) {
    throw new AppError('Sale not found', 404, 'NOT_FOUND');
  }

  // Validate return items
  const { data: saleItems, error: itemsError } = await supabase
    .from('sale_item')
    .select('*')
    .eq('sale_id', body.sale_id);

  if (itemsError) {
    throw new AppError('Failed to fetch sale items', 500, 'DATABASE_ERROR');
  }

  // Validate quantities
  for (const returnItem of body.return_items) {
    const saleItem = saleItems?.find(si => si.id === returnItem.sale_item_id);
    if (!saleItem) {
      throw new AppError(`Sale item ${returnItem.sale_item_id} not found`, 404, 'NOT_FOUND');
    }

    // Check if already returned
    const { data: existingReturns } = await supabase
      .from('sale_return_item')
      .select('quantity_returned')
      .eq('sale_item_id', returnItem.sale_item_id);

    const alreadyReturned = existingReturns?.reduce((sum, r) => sum + r.quantity_returned, 0) || 0;
    const availableToReturn = saleItem.quantity - alreadyReturned;

    if (returnItem.quantity_returned > availableToReturn) {
      throw new AppError(
        `Cannot return ${returnItem.quantity_returned} items. Only ${availableToReturn} available to return.`,
        400,
        'INVALID_QUANTITY'
      );
    }
  }

  // Generate return number
  const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Calculate total return amount
  let totalReturnAmount = 0;
  const returnItemsData = body.return_items.map(item => {
    const saleItem = saleItems!.find(si => si.id === item.sale_item_id)!;
    const itemReturnAmount = saleItem.unit_price * item.quantity_returned;
    totalReturnAmount += itemReturnAmount;
    return {
      sale_item_id: item.sale_item_id,
      product_id: item.product_id,
      quantity_returned: item.quantity_returned,
      unit_price: saleItem.unit_price,
      total_return_amount: itemReturnAmount,
      return_reason: item.return_reason || null,
    };
  });

  // Create sale return
  const returnData = {
    sale_id: body.sale_id,
    return_number: returnNumber,
    store_id: sale.store_id,
    cashier_id: userId,
    customer_id: sale.customer_id,
    total_return_amount: totalReturnAmount,
    refund_method: body.refund_method,
    refund_status: 'pending',
    return_reason: body.return_reason || null,
    notes: body.notes || null,
  };

  const { data: saleReturn, error: returnError } = await supabase
    .from('sale_return')
    .insert(returnData)
    .select()
    .single();

  if (returnError) {
    throw new AppError('Failed to create sale return', 500, 'DATABASE_ERROR');
  }

  // Create return items
  const { error: itemsInsertError } = await supabase
    .from('sale_return_item')
    .insert(returnItemsData.map(item => ({
      ...item,
      sale_return_id: saleReturn.id,
    })));

  if (itemsInsertError) {
    // Rollback return creation
    await supabase.from('sale_return').delete().eq('id', saleReturn.id);
    throw new AppError('Failed to create return items', 500, 'DATABASE_ERROR');
  }

  // Fetch complete return with relations
  const { data: completeReturn } = await supabase
    .from('sale_return')
    .select(`
      *,
      sale:sale_id(id, receipt_number, transaction_date, total_amount),
      store:store_id(id, name),
      customer:customer_id(id, name, phone),
      cashier:cashier_id(id, name, username),
      return_items:sale_return_item(
        *,
        sale_item:sale_item_id(id, quantity, unit_price),
        product:product_id(id, name, sku)
      )
    `)
    .eq('id', saleReturn.id)
    .single();

  return successResponse({ return: completeReturn }, 'Sale return created successfully', 201);
}, { rateLimit: 'WRITE' });

