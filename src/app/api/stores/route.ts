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

    // Clean up the data - convert empty strings to null for optional UUID fields
    const cleanStoreData = {
      business_id,
      name,
      address: address || null,
      city: city || null,
      state: state || null,
      postal_code: postal_code || null,
      phone: phone || null,
      email: email || null,
      manager_name: manager_name || null,
      currency_id: currency_id === '' ? null : currency_id,
      language_id: language_id === '' ? null : language_id,
      country_id: country_id === '' ? null : country_id,
      is_active: true
    };

    // Create store and store settings in a transaction
    const { data: store, error: storeError } = await supabase
      .from('store')
      .insert(cleanStoreData)
      .select()
      .single();

    if (storeError) {
      console.error('Supabase error creating store:', storeError);
      return NextResponse.json(
        { success: false, error: 'Failed to create store' },
        { status: 500 }
      );
    }

    // Create default store settings for the new store
    const defaultStoreSettings = {
      store_id: store.id,
      tax_rate: 0.00,
      enable_tax: false,
      allow_returns: true,
      return_period_days: 30,
      enable_sounds: true,
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      accent_color: '#F59E0B'
    };

    const { data: storeSettings, error: settingsError } = await supabase
      .from('store_setting')
      .insert(defaultStoreSettings)
      .select()
      .single();

    if (settingsError) {
      console.error('Supabase error creating store settings:', settingsError);
      // If store settings creation fails, we should ideally rollback the store creation
      // For now, we'll return an error and the store will exist without settings
      return NextResponse.json(
        { 
          success: false, 
          error: 'Store created but failed to create store settings',
          store: store,
          settingsError: settingsError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store,
      store_settings: storeSettings
    }, { status: 201 });

  } catch (error) {
    console.error('Stores API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
