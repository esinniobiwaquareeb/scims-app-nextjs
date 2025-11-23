import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const convertQuotationSchema = z.object({
  store_id: z.string().uuid(),
  cashier_id: z.string().uuid(),
  customer_id: z.string().uuid().optional().nullable(),
  payment_method: z.string().default('cash'),
  notes: z.string().optional().nullable(),
});

// POST - Convert quotation to sale
export const POST = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, convertQuotationSchema);

  // Get quotation with items
  const { data: quotation, error: fetchError } = await supabase
    .from('quotation')
    .select(`
      *,
      items:quotation_item(
        *,
        product:product_id(id, name, sku, price, stock_quantity)
      )
    `)
    .eq('id', id)
    .single();

  if (fetchError || !quotation) {
    throw new AppError('Quotation not found', 404, 'NOT_FOUND');
  }

  if (quotation.status !== 'accepted') {
    throw new AppError('Only accepted quotations can be converted to sales', 400, 'INVALID_STATUS');
  }

  // Generate receipt number
  const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create sale
  const saleData = {
    store_id: body.store_id,
    cashier_id: body.cashier_id,
    customer_id: body.customer_id || null,
    receipt_number: receiptNumber,
    subtotal: quotation.subtotal,
    tax_amount: quotation.tax_amount,
    discount_amount: quotation.discount_amount,
    total_amount: quotation.total_amount,
    payment_method: body.payment_method,
    status: 'completed',
    payment_status: 'completed',
    notes: body.notes || quotation.notes || null,
    transaction_date: new Date().toISOString(),
  };

  const { data: sale, error: saleError } = await supabase
    .from('sale')
    .insert(saleData)
    .select()
    .single();

  if (saleError) {
    throw new AppError('Failed to create sale from quotation', 500, 'DATABASE_ERROR');
  }

  // Create sale items and update stock
  const saleItems = quotation.items.map((item: {
    product_id: string | null;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }) => {
    if (!item.product_id) {
      throw new AppError(`Item ${item.item_name} does not have a product ID`, 400, 'VALIDATION_ERROR');
    }

    return {
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      discount_amount: 0,
    };
  });

  const { error: itemsError } = await supabase
    .from('sale_item')
    .insert(saleItems);

  if (itemsError) {
    // Rollback sale creation
    await supabase.from('sale').delete().eq('id', sale.id);
    throw new AppError('Failed to create sale items', 500, 'DATABASE_ERROR');
  }

  // Update product stock
  for (const item of quotation.items) {
    if (item.product_id) {
      const { data: product } = await supabase
        .from('product')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('product')
          .update({
            stock_quantity: Math.max(0, product.stock_quantity - item.quantity),
          })
          .eq('id', item.product_id);
      }
    }
  }

  // Update quotation status to 'converted'
  await supabase
    .from('quotation')
    .update({ status: 'converted' })
    .eq('id', id);

  // Fetch complete sale
  const { data: completeSale } = await supabase
    .from('sale')
    .select(`
      *,
      store:store_id(id, name),
      customer:customer_id(id, name),
      cashier:cashier_id(id, name, username),
      items:sale_item(
        *,
        product:product_id(id, name, sku)
      )
    `)
    .eq('id', sale.id)
    .single();

  return successResponse({ sale: completeSale }, 'Quotation converted successfully', 201);
}, { rateLimit: 'WRITE' });

