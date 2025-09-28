/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { UpdateCouponData } from '@/types/discount';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: coupon, error } = await supabase
      .from('coupon')
      .select(`
        *,
        discount_type:discount_type_id(id, name, description),
        store:store_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching coupon:', error);
      return NextResponse.json(
        { error: 'Failed to fetch coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Error in GET /api/discounts/coupons/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateCouponData = await request.json();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (body.code !== undefined) updateData.code = body.code;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discount_type_id !== undefined) updateData.discount_type_id = body.discount_type_id;
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value;
    if (body.minimum_purchase_amount !== undefined) updateData.minimum_purchase_amount = body.minimum_purchase_amount;
    if (body.maximum_discount_amount !== undefined) updateData.maximum_discount_amount = body.maximum_discount_amount;
    if (body.applicable_products !== undefined) updateData.applicable_products = body.applicable_products;
    if (body.applicable_categories !== undefined) updateData.applicable_categories = body.applicable_categories;
    if (body.applicable_brands !== undefined) updateData.applicable_brands = body.applicable_brands;
    if (body.customer_restrictions !== undefined) updateData.customer_restrictions = body.customer_restrictions;
    if (body.usage_limit !== undefined) updateData.usage_limit = body.usage_limit;
    if (body.usage_limit_per_customer !== undefined) updateData.usage_limit_per_customer = body.usage_limit_per_customer;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.store_id !== undefined) updateData.store_id = body.store_id;

    const { data: coupon, error } = await supabase
      .from('coupon')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        discount_type:discount_type_id(id, name, description),
        store:store_id(id, name)
      `)
      .single();

    if (error) {
      console.error('Error updating coupon:', error);
      return NextResponse.json(
        { error: 'Failed to update coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Error in PUT /api/discounts/coupons/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('coupon')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting coupon:', error);
      return NextResponse.json(
        { error: 'Failed to delete coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/discounts/coupons/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
