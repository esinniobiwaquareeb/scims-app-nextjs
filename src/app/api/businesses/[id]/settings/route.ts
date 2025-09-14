import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

interface BusinessUpdateData {
  currency_id?: string | null;
  language_id?: string | null;
  country_id?: string | null;
  business_type?: string;
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  timezone?: string;
  username?: string;
  slug?: string;
  updated_at: string;
}

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

    // Fetch business information
    const { data: business, error: businessError } = await supabase
      .from('business')
      .select('*')
      .eq('id', businessId)
      .single();



    if (businessError) {
      console.error('Business fetch error:', businessError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch business information' },
        { status: 500 }
      );
    }

    // Fetch business settings
    const { data: settings, error: settingsError } = await supabase
      .from('business_setting')
      .select('*')
      .eq('business_id', businessId)
      .single();

    // If settings don't exist, that's okay - we'll return empty settings
    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch business settings' },
        { status: 500 }
      );
    }

    // Combine business and settings data
    const combinedData = {
      // Business table fields
      name: business?.name || '',
      description: business?.description || '',
      industry: business?.industry || '',
      timezone: business?.timezone || 'UTC',
      subscription_status: business?.subscription_status || 'active',
      subscription_expires_at: business?.subscription_expires_at || '',
      is_active: business?.is_active ?? true,
      address: business?.address || '',
      email: business?.email || '',
      phone: business?.phone || '',
      website: business?.website || '',
      subscription_plan_id: business?.subscription_plan_id || '',
      currency_id: business?.currency_id || '',
      language_id: business?.language_id || '',
      country_id: business?.country_id || '',
      business_type: business?.business_type || 'retail',
      username: business?.username || '',
      slug: business?.slug || '',
      
      // Business setting table fields (with defaults)
      taxRate: settings?.tax_rate || 0,
      enableTax: settings?.enable_tax ?? false,
      discountRate: settings?.discount_rate || 0,
      enableDiscount: settings?.enable_discount ?? false,
      allowReturns: settings?.allow_returns ?? true,
      returnPeriodDays: settings?.return_period_days || 30,
      enableSounds: settings?.enable_sounds ?? true,
      logo_url: settings?.logo_url || '',
      receiptHeader: settings?.receipt_header || 'Thank you for shopping with us!',
      receiptFooter: settings?.receipt_footer || 'Returns accepted within 30 days with receipt.',
      returnPolicy: settings?.return_policy || 'Returns accepted within 30 days with original receipt.',
      warrantyInfo: settings?.warranty_info || 'Standard manufacturer warranty applies.',
      termsOfService: settings?.terms_of_service || '',
      privacyPolicy: settings?.privacy_policy || '',
      primaryColor: settings?.primary_color || '#3B82F6',
      secondaryColor: settings?.secondary_color || '#10B981',
      accentColor: settings?.accent_color || '#F59E0B',
      enable_stock_tracking: settings?.enable_stock_tracking ?? true,
      enable_inventory_alerts: settings?.enable_inventory_alerts ?? true,
      enable_restock_management: settings?.enable_restock_management ?? true,
      enable_recipe_management: settings?.enable_recipe_management ?? false,
      enable_service_booking: settings?.enable_service_booking ?? false,
      enable_menu_management: settings?.enable_menu_management ?? false,
      enable_ingredient_tracking: settings?.enable_ingredient_tracking ?? false,
      enable_public_store: settings?.enable_public_store ?? false,
      store_theme: settings?.store_theme || 'default',
      store_banner_url: settings?.store_banner_url || '',
      store_description: settings?.store_description || '',
      whatsapp_phone: settings?.whatsapp_phone || '',
      whatsapp_message_template: settings?.whatsapp_message_template || 'New order received from {customer_name}!\n\nOrder Details:\n{order_items}\n\nTotal: {total_amount}\n\nCustomer: {customer_name}\nPhone: {customer_phone}\nAddress: {customer_address}'
    };


    return NextResponse.json({
      success: true,
      settings: combinedData
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

    // Prepare business data (currency_id and language_id belong to business table)
    const businessData: Partial<BusinessUpdateData> = {};
    if (body.currency_id !== undefined) businessData.currency_id = body.currency_id;
    if (body.language_id !== undefined) businessData.language_id = body.language_id;
    if (body.country_id !== undefined) businessData.country_id = body.country_id;
    if (body.business_type !== undefined) businessData.business_type = body.business_type;
    if (body.name !== undefined) businessData.name = body.name;
    if (body.description !== undefined) businessData.description = body.description;
    if (body.email !== undefined) businessData.email = body.email;
    if (body.phone !== undefined) businessData.phone = body.phone;
    if (body.website !== undefined) businessData.website = body.website;
    if (body.address !== undefined) businessData.address = body.address;
    if (body.timezone !== undefined) businessData.timezone = body.timezone;
    if (body.username !== undefined) businessData.username = body.username;
    if (body.slug !== undefined) businessData.slug = body.slug;
    
    // Validate unique constraints before updating
    if (businessData.username) {
      const { data: existingUser } = await supabase
        .from('business')
        .select('id')
        .eq('username', businessData.username)
        .neq('id', businessId)
        .single();
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Username already exists' },
          { status: 400 }
        );
      }
    }
    
    if (businessData.slug) {
      const { data: existingSlug } = await supabase
        .from('business')
        .select('id')
        .eq('slug', businessData.slug)
        .neq('id', businessId)
        .single();
      
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }
    
    if (Object.keys(businessData).length > 0) {
      businessData.updated_at = new Date().toISOString();
    }

    // Prepare settings data for database (business_setting table)
    const settingsData = {
      business_id: businessId,
      tax_rate: body.taxRate || 0,
      enable_tax: body.enableTax || false,
      discount_rate: body.discountRate || 0,
      enable_discount: body.enableDiscount || false,
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
      enable_stock_tracking: body.enable_stock_tracking || true,
      enable_inventory_alerts: body.enable_inventory_alerts || true,
      enable_restock_management: body.enable_restock_management || true,
      enable_recipe_management: body.enable_recipe_management || false,
      enable_service_booking: body.enable_service_booking || false,
      enable_menu_management: body.enable_menu_management || false,
      enable_ingredient_tracking: body.enable_ingredient_tracking || false,
      enable_public_store: body.enable_public_store || false,
      store_theme: body.store_theme || 'default',
      store_banner_url: body.store_banner_url || '',
      store_description: body.store_description || '',
      whatsapp_phone: body.whatsapp_phone || '',
      whatsapp_message_template: body.whatsapp_message_template || 'New order received from {customer_name}!\n\nOrder Details:\n{order_items}\n\nTotal: {total_amount}\n\nCustomer: {customer_name}\nPhone: {customer_phone}\nAddress: {customer_address}',
      updated_at: new Date().toISOString()
    };

    // Update business table if there's business data to update
    if (Object.keys(businessData).length > 0) {
      const { error: businessError } = await supabase
        .from('business')
        .update(businessData)
        .eq('id', businessId);

      if (businessError) {
        console.error('Error updating business:', businessError);
        return NextResponse.json(
          { success: false, error: 'Failed to update business information' },
          { status: 500 }
        );
      }
    }

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
