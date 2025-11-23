import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { z } from 'zod';

const updateUnitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  symbol: z.string().max(20).optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

const pathParamsSchema = z.object({
  id: z.string().uuid(),
});

const handler = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  if (request.method === 'GET') {
    const { data: unit, error } = await supabase
      .from('unit')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !unit) {
      return NextResponse.json(
        { success: false, error: 'Unit not found' },
        { status: 404 }
      );
    }

    // Count products that use this unit name
    const { count, error: countError } = await supabase
      .from('product')
      .select('id', { count: 'exact', head: true })
      .eq('unit', unit.name)
      .eq('business_id', unit.business_id);

    if (countError) {
      console.error('Error counting products for unit:', unit.name, countError);
    }

    return NextResponse.json({
      success: true,
      unit: {
        ...unit,
        product_count: count || 0
      }
    });
  }

  if (request.method === 'PUT' || request.method === 'PATCH') {
    const body = await validateRequestBody(request, updateUnitSchema);

    // Check if updating name, verify uniqueness
    if (body.name) {
      // Get current unit to check business_id
      const { data: currentUnit } = await supabase
        .from('unit')
        .select('business_id')
        .eq('id', id)
        .single();

      if (currentUnit) {
        const { data: existingUnit, error: checkError } = await supabase
          .from('unit')
          .select('id')
          .eq('business_id', currentUnit.business_id)
          .eq('name', body.name.trim())
          .neq('id', id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing unit:', checkError);
          return NextResponse.json(
            { success: false, error: 'Failed to validate unit' },
            { status: 500 }
          );
        }

        if (existingUnit) {
          return NextResponse.json(
            { success: false, error: 'Unit with this name already exists' },
            { status: 409 }
          );
        }
      }
    }

    const { data: updatedUnit, error } = await supabase
      .from('unit')
      .update({
        ...body,
        name: body.name?.trim(),
        symbol: body.symbol?.trim() || null,
        description: body.description?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating unit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update unit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      unit: updatedUnit
    });
  }

  if (request.method === 'DELETE') {
    // First, get the unit name to check if it's used by products
    const { data: unitToDelete, error: fetchError } = await supabase
      .from('unit')
      .select('name')
      .eq('id', id)
      .single();

    if (fetchError || !unitToDelete) {
      return NextResponse.json(
        { success: false, error: 'Unit not found' },
        { status: 404 }
      );
    }

    // Check if unit is used by any products (by name since product.unit is varchar)
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select('id')
      .eq('unit', unitToDelete.name)
      .limit(1);

    if (productsError) {
      console.error('Error checking unit usage:', productsError);
    }

    // Warn if products use this unit, but allow deletion
    if (products && products.length > 0) {
      // We'll still allow deletion, but the UI should warn users
      // The product.unit field will remain as a string even if the unit is deleted
    }

    const { error } = await supabase
      .from('unit')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting unit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete unit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Unit deleted successfully',
      warning: products && products.length > 0 
        ? `This unit is used by ${products.length} product(s). Their unit field will remain as "${unitToDelete.name}".`
        : undefined
    });
  }

  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}, { rateLimit: 'WRITE' });

export const GET = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

