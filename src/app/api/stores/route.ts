import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const storeId = searchParams.get('store_id');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('store')
      .select(`
        *,
        business:business_id (
          id,
          name,
          business_type
        ),
        currency:currency_id (
          id,
          code,
          symbol
        ),
        language:language_id (
          id,
          code,
          name
        ),
        country:country_id (
          id,
          name,
          code
        )
      `);

    // Apply filters
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    if (storeId) {
      query = query.eq('id', storeId);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: stores, error } = await query.order('name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stores' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stores: stores || []
    });

  } catch (error) {
    console.error('Stores API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      name,
      address,
      city,
      state,
      postal_code,
      phone,
      email,
      manager_name,
      currency_id,
      language_id,
      country_id
    } = body;

    if (!business_id || !name) {
      return NextResponse.json(
        { success: false, error: 'business_id and name are required' },
        { status: 400 }
      );
    }

    const { data: store, error } = await supabase
      .from('store')
      .insert({
        business_id,
        name,
        address,
        city,
        state,
        postal_code,
        phone,
        email,
        manager_name,
        currency_id,
        language_id,
        country_id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create store' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store
    }, { status: 201 });

  } catch (error) {
    console.error('Stores API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
