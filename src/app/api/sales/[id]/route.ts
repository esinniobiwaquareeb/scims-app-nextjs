import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const updateSaleSchema = z.object({
  transaction_date: z.string().optional(),
  notes: z.string().optional().nullable(),
  delivery_cost: z.number().nonnegative().optional(),
  payment_status: z.enum(['pending', 'partial', 'fully_paid', 'completed', 'overdue', 'cancelled']).optional(),
  is_editable: z.boolean().optional(),
});

const addItemsSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    unit_price: z.number().nonnegative(),
    discount_amount: z.number().nonnegative().default(0),
  })),
});

// GET - Get single sale
export const GET = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  const { data: sale, error } = await supabase
    .from('sale')
    .select(`
      *,
      store:store_id(id, name),
      customer:customer_id(id, name, phone, email),
      cashier:cashier_id(id, name, username),
      items:sale_item(
        *,
        product:product_id(id, name, sku, barcode, price, stock_quantity)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !sale) {
    throw new AppError('Sale not found', 404, 'NOT_FOUND');
  }

  return successResponse({ sale });
}, { rateLimit: 'API' });

// PATCH - Update sale (backdate, edit notes, update delivery cost, etc.)
export const PATCH = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, updateSaleSchema);

  // Get current sale
  const { data: currentSale, error: fetchError } = await supabase
    .from('sale')
    .select('status, is_editable, transaction_date')
    .eq('id', id)
    .single();

  if (fetchError || !currentSale) {
    throw new AppError('Sale not found', 404, 'NOT_FOUND');
  }

  // Check if sale is editable
  if (currentSale.status === 'completed' && currentSale.is_editable === false) {
    throw new AppError('This sale is not editable', 403, 'NOT_EDITABLE');
  }

  // Validate transaction_date is not in future
  if (body.transaction_date) {
    const transactionDate = new Date(body.transaction_date);
    const now = new Date();
    if (transactionDate > now) {
      throw new AppError('Transaction date cannot be in the future', 400, 'VALIDATION_ERROR');
    }
  }

  const updateData: Record<string, unknown> = {};
  if (body.transaction_date) updateData.transaction_date = body.transaction_date;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.delivery_cost !== undefined) {
    updateData.delivery_cost = body.delivery_cost;
    // Recalculate total if delivery cost changes
    if (currentSale && 'total_amount' in currentSale && 'delivery_cost' in currentSale) {
      const currentTotal = typeof currentSale.total_amount === 'number' ? currentSale.total_amount : 0;
      const currentDelivery = typeof currentSale.delivery_cost === 'number' ? currentSale.delivery_cost : 0;
      const newTotal = currentTotal - currentDelivery + (body.delivery_cost || 0);
      updateData.total_amount = newTotal;
    }
  }
  if (body.payment_status) updateData.payment_status = body.payment_status;
  if (body.is_editable !== undefined) updateData.is_editable = body.is_editable;

  const { data: sale, error: updateError } = await supabase
    .from('sale')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      store:store_id(id, name),
      customer:customer_id(id, name, phone),
      cashier:cashier_id(id, name, username),
      items:sale_item(
        *,
        product:product_id(id, name, sku)
      )
    `)
    .single();

  if (updateError) {
    throw new AppError('Failed to update sale', 500, 'DATABASE_ERROR');
  }

  return successResponse({ sale });
}, { rateLimit: 'WRITE' });

// POST - Add items to completed sale
export const POST = createApiHandler(async ({ request, params }) => {
  const { id } = params!;
  const body = await validateRequestBody(request, addItemsSchema);

  // Get current sale
  const { data: currentSale, error: fetchError } = await supabase
    .from('sale')
    .select('status, is_editable, store_id, subtotal, tax_amount, discount_amount, total_amount, delivery_cost')
    .eq('id', id)
    .single();

  if (fetchError || !currentSale) {
    throw new AppError('Sale not found', 404, 'NOT_FOUND');
  }

  // Check if sale can be edited
  if (currentSale.status !== 'completed' || currentSale.is_editable === false) {
    throw new AppError('This sale cannot be edited', 403, 'NOT_EDITABLE');
  }

  // Validate products and stock
  let newSubtotal = currentSale.subtotal;
  const newItems = [];

  for (const item of body.items) {
    // Check product exists and has stock
    const { data: product, error: productError } = await supabase
      .from('product')
      .select('id, name, price, stock_quantity')
      .eq('id', item.product_id)
      .eq('store_id', currentSale.store_id)
      .single();

    if (productError || !product) {
      throw new AppError(`Product ${item.product_id} not found in store`, 404, 'NOT_FOUND');
    }

    if (product.stock_quantity < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    const itemTotal = (item.unit_price * item.quantity) - (item.discount_amount || 0);
    newSubtotal += itemTotal;

    newItems.push({
      sale_id: id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: itemTotal,
      discount_amount: item.discount_amount || 0,
    });
  }

  // Calculate new totals
  const newTotal = newSubtotal + currentSale.tax_amount - currentSale.discount_amount + (currentSale.delivery_cost || 0);

  // Insert new sale items
  const { error: itemsError } = await supabase
    .from('sale_item')
    .insert(newItems);

  if (itemsError) {
    throw new AppError('Failed to add items to sale', 500, 'DATABASE_ERROR');
  }

  // Update sale totals
  const { error: updateError } = await supabase
    .from('sale')
    .update({
      subtotal: newSubtotal,
      total_amount: newTotal,
    })
    .eq('id', id);

  if (updateError) {
    throw new AppError('Failed to update sale totals', 500, 'DATABASE_ERROR');
  }

  // Update product stock
  for (const item of body.items) {
    const { data: product } = await supabase
      .from('product')
      .select('stock_quantity')
      .eq('id', item.product_id)
      .eq('store_id', currentSale.store_id)
      .single();

    if (product) {
      await supabase
        .from('product')
        .update({
          stock_quantity: Math.max(0, product.stock_quantity - item.quantity),
        })
        .eq('id', item.product_id)
        .eq('store_id', currentSale.store_id);
    }
  }

  // Fetch updated sale
  const { data: updatedSale } = await supabase
    .from('sale')
    .select(`
      *,
      store:store_id(id, name),
      customer:customer_id(id, name, phone),
      cashier:cashier_id(id, name, username),
      items:sale_item(
        *,
        product:product_id(id, name, sku)
      )
    `)
    .eq('id', id)
    .single();

  return successResponse({ sale: updatedSale });
}, { rateLimit: 'WRITE' });

// DELETE - Delete sale (only if recent and with proper permissions)
export const DELETE = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  // Get current sale
  const { data: currentSale, error: fetchError } = await supabase
    .from('sale')
    .select('status, transaction_date, store_id, items:sale_item(product_id, quantity)')
    .eq('id', id)
    .single();

  if (fetchError || !currentSale) {
    throw new AppError('Sale not found', 404, 'NOT_FOUND');
  }

  // Only allow deletion of sales from today
  const saleDate = new Date(currentSale.transaction_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  saleDate.setHours(0, 0, 0, 0);

  if (saleDate.getTime() !== today.getTime()) {
    throw new AppError('Can only delete sales from today', 403, 'INVALID_DATE');
  }

  // Restore stock for all items
  if (currentSale.items && Array.isArray(currentSale.items)) {
    for (const item of currentSale.items) {
      const { data: product } = await supabase
        .from('product')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .eq('store_id', currentSale.store_id)
        .single();

      if (product) {
        await supabase
          .from('product')
          .update({
            stock_quantity: product.stock_quantity + item.quantity,
          })
          .eq('id', item.product_id)
          .eq('store_id', currentSale.store_id);
      }
    }
  }

  // Delete sale (cascade will delete sale_items)
  const { error: deleteError } = await supabase
    .from('sale')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new AppError('Failed to delete sale', 500, 'DATABASE_ERROR');
  }

  return successResponse({ message: 'Sale deleted successfully. Stock has been restored.' });
}, { rateLimit: 'WRITE' });

