import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { CreateCouponData } from '@/types/discount';

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
      .from('coupon')
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

    const { data: coupons, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch coupons' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error in GET /api/discounts/coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCouponData = await request.json();
    const { business_id, code } = body;

    if (!business_id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists for this business
    const { data: existingCoupon, error: checkError } = await supabase
      .from('coupon')
      .select('id')
      .eq('business_id', business_id)
      .eq('code', code)
      .single();

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists for this business' },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabase
      .from('coupon')
      .insert({
        business_id,
        code: body.code,
        name: body.name,
        description: body.description,
        discount_type_id: body.discount_type_id,
        discount_value: body.discount_value,
        minimum_purchase_amount: body.minimum_purchase_amount || 0,
        maximum_discount_amount: body.maximum_discount_amount,
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
      console.error('Error creating coupon:', error);
      return NextResponse.json(
        { error: 'Failed to create coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/discounts/coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
