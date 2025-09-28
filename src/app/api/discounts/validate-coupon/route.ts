import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  try {
    const { 
      coupon_code, 
      business_id, 
      store_id, 
      customer_id, 
      subtotal 
    } = await request.json();

    if (!coupon_code || !business_id || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Use the database function to validate coupon
    const { data, error } = await supabase.rpc('validate_coupon_usage', {
      coupon_code,
      business_id_param: business_id,
      store_id_param: store_id || null,
      customer_id_param: customer_id || null,
      subtotal
    });

    if (error) {
      console.error('Error validating coupon:', error);
      return NextResponse.json(
        { error: 'Failed to validate coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: data });
  } catch (error) {
    console.error('Error in POST /api/discounts/validate-coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
