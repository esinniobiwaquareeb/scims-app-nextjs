import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { validateRequestBody } from '@/utils/api-validation';
import { z } from 'zod';

const createUnitSchema = z.object({
  name: z.string().min(1).max(100),
  symbol: z.string().max(20).optional().nullable(),
  description: z.string().optional().nullable(),
  business_id: z.string().uuid(),
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

const handler = createApiHandler(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (request.method === 'GET') {
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'business_id is required' },
        { status: 400 }
      );
    }

    // Fetch units for the business
    const { data: units, error } = await supabase
      .from('unit')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch units' },
        { status: 500 }
      );
    }

    // Fetch product counts for each unit by matching unit name
    // Since product.unit is a string field, we need to count manually
    const unitsWithCounts = await Promise.all(
      (units || []).map(async (unit) => {
        // Count products that use this unit name
        const { count, error: countError } = await supabase
          .from('product')
          .select('id', { count: 'exact', head: true })
          .eq('unit', unit.name)
          .eq('business_id', businessId);

        if (countError) {
          console.error('Error counting products for unit:', unit.name, countError);
          return {
            ...unit,
            product_count: 0
          };
        }

        return {
          ...unit,
          product_count: count || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      units: unitsWithCounts
    });
  }

  if (request.method === 'POST') {
    const body = await validateRequestBody(request, createUnitSchema);

    // Check if unit with same name already exists for this business
    const { data: existingUnit, error: checkError } = await supabase
      .from('unit')
      .select('id')
      .eq('business_id', body.business_id)
      .eq('name', body.name.trim())
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

    // Create the unit
    const { data: newUnit, error: createError } = await supabase
      .from('unit')
      .insert({
        name: body.name.trim(),
        symbol: body.symbol?.trim() || null,
        description: body.description?.trim() || null,
        business_id: body.business_id,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase error creating unit:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create unit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      unit: {
        ...newUnit,
        product_count: 0
      }
    }, { status: 201 });
  }

  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}, { rateLimit: 'API' });

export const GET = handler;
export const POST = handler;

