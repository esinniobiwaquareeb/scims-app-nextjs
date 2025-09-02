import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Fetch business settings
    const { data: settings, error } = await supabase
      .from('business_setting')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch business settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: settings || {}
    });

  } catch (error) {
    console.error('Business settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update business settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;
    const body = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Prepare settings data for database
    const settingsData = {
      business_id: businessId,
      currency_id: body.currency_id || null,
      language_id: body.language_id || null,
      tax_rate: body.taxRate || 0,
      enable_tax: body.enableTax || false,
      allow_returns: body.allowReturns || true,
      return_period_days: body.returnPeriodDays || 30,
      enable_sounds: body.enableSounds || true,
      logo_url: body.logo_url || '',
      receipt_header: body.receiptHeader || 'Thank you for shopping with us!',
      receipt_footer: body.receiptFooter || 'Returns accepted within 30 days with receipt.',
      return_policy: body.returnPolicy || 'Returns accepted within 30 days with original receipt.',
      warranty_info: body.warrantyInfo || 'Standard manufacturer warranty applies.',
      terms_of_service: body.termsOfService || '',
      privacy_policy: body.privacyPolicy || '',
      primary_color: body.primaryColor || '#3B82F6',
      secondary_color: body.secondaryColor || '#10B981',
      accent_color: body.accentColor || '#F59E0B',
      business_type: body.business_type || 'retail',
      enable_stock_tracking: body.enable_stock_tracking || true,
      enable_inventory_alerts: body.enable_inventory_alerts || true,
      enable_restock_management: body.enable_restock_management || true,
      enable_recipe_management: body.enable_recipe_management || false,
      enable_service_booking: body.enable_service_booking || false,
      enable_menu_management: body.enable_menu_management || false,
      enable_ingredient_tracking: body.enable_ingredient_tracking || false,
      updated_at: new Date().toISOString()
    };

    // Check if settings exist
    const { error: checkError } = await supabase
      .from('business_setting')
      .select('id')
      .eq('business_id', businessId)
      .single();

    let result;
    if (checkError && checkError.code === 'PGRST116') {
      // Settings don't exist, create new ones
      result = await supabase
        .from('business_setting')
        .insert(settingsData)
        .select()
        .single();
    } else if (checkError) {
      console.error('Error checking existing settings:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing settings' },
        { status: 500 }
      );
    } else {
      // Settings exist, update them
      result = await supabase
        .from('business_setting')
        .update(settingsData)
        .eq('business_id', businessId)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving business settings:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to save business settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: result.data,
      message: 'Business settings updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/businesses/[id]/settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
