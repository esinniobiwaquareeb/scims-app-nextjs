import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  try {
    const { 
      business_id, 
      store_id, 
      customer_id, 
      subtotal,
      product_ids 
    } = await request.json();

    if (!business_id || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Use the database function to get applicable promotions
    const { data, error } = await supabase.rpc('get_applicable_promotions', {
      business_id_param: business_id,
      store_id_param: store_id || null,
      customer_id_param: customer_id || null,
      subtotal,
      product_ids: product_ids || null
    });

    if (error) {
      console.error('Error getting applicable promotions:', error);
      return NextResponse.json(
        { error: 'Failed to get applicable promotions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ promotions: data });
  } catch (error) {
    console.error('Error in POST /api/discounts/applicable-promotions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
