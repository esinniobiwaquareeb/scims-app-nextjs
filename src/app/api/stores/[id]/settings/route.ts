import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // First check if the store exists
    const { data: store, error: storeError } = await supabase
      .from('store')
      .select('id, name')
      .eq('id', storeId)
      .single();

    if (storeError) {
      console.error('Store not found:', storeError);
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Try to fetch store settings, but don't fail if they don't exist
    const { data: settings, error: settingsError } = await supabase
      .from('store_setting')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Supabase error:', settingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch store settings' },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    const defaultSettings = {
      store_id: storeId,
      currency_id: null,
      language_id: null,
      tax_rate: 0.00,
      enable_tax: false,
      discount_rate: 0.00,
      enable_discount: false,
      allow_returns: true,
      return_period_days: 30,
      enable_sounds: true,
      logo_url: null,
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      accent_color: '#F59E0B',
      receipt_header: store.name,
      receipt_footer: 'Thank you for your business!',
      return_policy: null,
      contact_person: null,
      store_hours: null,
      store_promotion_info: null,
      custom_receipt_message: null
    };

    return NextResponse.json({
      success: true,
      settings: settings || defaultSettings
    });

  } catch (error) {
    console.error('Store settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    const body = await request.json();
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // First check if store settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('store_setting')
      .select('id')
      .eq('store_id', storeId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing settings:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing settings' },
        { status: 500 }
      );
    }

    let result;
    
    if (existingSettings) {
      // Update existing settings
      const { data: settings, error } = await supabase
        .from('store_setting')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('store_id', storeId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update store settings' },
          { status: 500 }
        );
      }
      
      result = settings;
    } else {
      // Insert new settings
      const { data: settings, error } = await supabase
        .from('store_setting')
        .insert({
          store_id: storeId,
          ...body,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create store settings' },
          { status: 500 }
        );
      }
      
      result = settings;
    }

    return NextResponse.json({
      success: true,
      settings: result
    });

  } catch (error) {
    console.error('Store settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
