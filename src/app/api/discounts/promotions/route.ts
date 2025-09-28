/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { CreatePromotionData } from '@/types/discount';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const storeId = searchParams.get('store_id');
    const isActive = searchParams.get('is_active');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('promotion')
      .select(`
        *,
        discount_type:discount_type_id(id, name, description),
        store:store_id(id, name)
      `)
      .eq('business_id', businessId);

    if (storeId) {
      query = query.or(`store_id.is.null,store_id.eq.${storeId}`);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: promotions, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promotions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch promotions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error('Error in GET /api/discounts/promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePromotionData = await request.json();
    const business_id = (body as any).business_id;

    if (!business_id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const { data: promotion, error } = await supabase
      .from('promotion')
      .insert({
        business_id,
        name: body.name,
        description: body.description,
        discount_type_id: body.discount_type_id,
        discount_value: body.discount_value,
        minimum_purchase_amount: body.minimum_purchase_amount || 0,
        maximum_discount_amount: body.maximum_discount_amount,
        minimum_quantity: body.minimum_quantity || 1,
        maximum_quantity: body.maximum_quantity,
        applicable_products: body.applicable_products,
        applicable_categories: body.applicable_categories,
        applicable_brands: body.applicable_brands,
        customer_restrictions: body.customer_restrictions,
        usage_limit: body.usage_limit,
        usage_limit_per_customer: body.usage_limit_per_customer || 1,
        start_date: body.start_date,
        end_date: body.end_date,
        store_id: body.store_id,
        is_active: true
      })
      .select(`
        *,
        discount_type:discount_type_id(id, name, description),
        store:store_id(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating promotion:', error);
      return NextResponse.json(
        { error: 'Failed to create promotion' },
        { status: 500 }
      );
    }

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/discounts/promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
