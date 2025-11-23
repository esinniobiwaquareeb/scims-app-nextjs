import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';
import { z } from 'zod';

const bulkPriceAdjustmentSchema = z.object({
  business_id: z.string().uuid(),
  category_id: z.string().uuid().optional().nullable(),
  adjustment_type: z.enum(['increase', 'decrease']),
  adjustment_value: z.number().positive(),
  adjustment_method: z.enum(['percentage', 'fixed']),
});

// POST - Bulk adjust prices by category
export const POST = createApiHandler(async ({ request }) => {
  const body = await validateRequestBody(request, bulkPriceAdjustmentSchema);

  // Get user ID
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new AppError('User ID is required', 401, 'UNAUTHORIZED');
  }

  // Build query to get products
  let productQuery = supabase
    .from('product')
    .select('id, name, price, category_id, store_id')
    .eq('business_id', body.business_id)
    .eq('is_active', true);

  if (body.category_id) {
    productQuery = productQuery.eq('category_id', body.category_id);
  }

  const { data: products, error: productsError } = await productQuery;

  if (productsError) {
    throw new AppError('Failed to fetch products', 500, 'DATABASE_ERROR');
  }

  if (!products || products.length === 0) {
    throw new AppError('No products found matching criteria', 404, 'NOT_FOUND');
  }

  // Calculate new prices
  const updates = products.map(product => {
    let newPrice = product.price;

    if (body.adjustment_method === 'percentage') {
      const adjustment = (product.price * body.adjustment_value) / 100;
      newPrice = body.adjustment_type === 'increase'
        ? product.price + adjustment
        : product.price - adjustment;
    } else {
      // Fixed amount
      newPrice = body.adjustment_type === 'increase'
        ? product.price + body.adjustment_value
        : product.price - body.adjustment_value;
    }

    // Ensure price doesn't go negative
    newPrice = Math.max(0, newPrice);

    return {
      id: product.id,
      price: parseFloat(newPrice.toFixed(2)),
    };
  });

  // Update products in batches (Supabase has limits)
  const batchSize = 100;
  const batches = [];
  for (let i = 0; i < updates.length; i += batchSize) {
    batches.push(updates.slice(i, i + batchSize));
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const batch of batches) {
    for (const update of batch) {
      const { error: updateError } = await supabase
        .from('product')
        .update({ price: update.price })
        .eq('id', update.id);

      if (updateError) {
        errorCount++;
        errors.push(`Failed to update product ${update.id}: ${updateError.message}`);
      } else {
        successCount++;
      }
    }
  }

  return successResponse({
    message: `Price adjustment completed. ${successCount} products updated, ${errorCount} errors.`,
    success_count: successCount,
    error_count: errorCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}, { rateLimit: 'WRITE' });

