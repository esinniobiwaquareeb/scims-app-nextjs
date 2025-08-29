import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'store_id is required' },
        { status: 400 }
      );
    }

    // Fetch saved carts for the specific store
    const { data: carts, error } = await supabase
      .from('saved_cart')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch saved carts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      carts: carts || []
    });

  } catch (error) {
    console.error('Saved carts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cartData = await request.json();
    
    console.log('Received cart data:', cartData);
    
    // Validate required fields
    if (!cartData.store_id || !cartData.cart_data || !cartData.cashier_id) {
      console.error('Validation failed:', { 
        store_id: !!cartData.store_id, 
        cart_data: !!cartData.cart_data, 
        cashier_id: !!cartData.cashier_id 
      });
      return NextResponse.json(
        { success: false, error: 'store_id, cart_data, and cashier_id are required' },
        { status: 400 }
      );
    }

    // Create new saved cart
    const { data: cart, error } = await supabase
      .from('saved_cart')
      .insert({
        ...cartData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cart
    });

  } catch (error) {
    console.error('Saved carts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
