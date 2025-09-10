import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    // Fetch platform settings from the system_settings table
    const { data: systemSettings, error: systemError } = await supabase
      .from('platform_setting')
      .select('*')
      .single();

    if (systemError && systemError.code !== 'PGRST116') {
      console.error('Supabase error:', systemError);
      return NextResponse.json(
        { error: 'Failed to fetch platform settings' },
        { status: 500 }
      );
    }

    // Fetch supported currencies
    const { data: currencies, error: currenciesError } = await supabase
      .from('currency')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (currenciesError) {
      console.error('Supabase error:', currenciesError);
      return NextResponse.json(
        { error: 'Failed to fetch currencies' },
        { status: 500 }
      );
    }

    // Fetch supported languages
    const { data: languages, error: languagesError } = await supabase
      .from('language')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (languagesError) {
      console.error('Supabase error:', languagesError);
      return NextResponse.json(
        { error: 'Failed to fetch languages' },
        { status: 500 }
      );
    }

    // Transform currencies to match expected format
    const transformedCurrencies = currencies?.map(currency => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimals: currency.decimals || 2
    })) || [];

    // Transform languages to match expected format
    const transformedLanguages = languages?.map(language => ({
      code: language.code,
      name: language.name,
      nativeName: language.native_name,
      rtl: language.rtl || false
    })) || [];

    // Create default platform settings if none exist
    const defaultSettings = {
      platform_name: 'SCIMS',
      platform_version: '1.0.0',
      default_currency: 'USD',
      default_language: 'en',
      timezone: 'UTC',
      date_format: 'MM/dd/yyyy',
      time_format: '12h' as const,
      demo_mode: false,
      maintenance_mode: false,
      maintenance_message: 'System is under maintenance. Please try again later.',
      allow_username_login: true,
      require_email_verification: false,
      session_timeout: 480,
      max_login_attempts: 5,
      platform_phone: '+1-800-SCIMS-01',
      platform_whatsapp: '+1-800-SCIMS-01',
      platform_email: 'support@scims.app',
      platform_website: 'https://scims.app',
      enable_pay_on_delivery: true,
      enable_online_payment: false,
      payment_methods: ['pay_on_delivery'],
      supported_currencies: transformedCurrencies,
      supported_languages: transformedLanguages
    };

    // Merge with existing system settings if they exist
    const settings = systemSettings ? {
      ...defaultSettings,
      ...systemSettings,
      supported_currencies: transformedCurrencies,
      supported_languages: transformedLanguages
    } : defaultSettings;

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platform_name,
      platform_version,
      default_currency,
      default_language,
      timezone,
      date_format,
      time_format,
      demo_mode,
      maintenance_mode,
      maintenance_message,
      allow_username_login,
      require_email_verification,
      session_timeout,
      max_login_attempts,
      platform_phone,
      platform_whatsapp,
      platform_email,
      platform_website,
      enable_pay_on_delivery,
      enable_online_payment,
      payment_methods
    } = body;

    // Validate required fields
    if (!platform_name || !platform_version) {
      return NextResponse.json(
        { error: 'Missing required fields: platform_name, platform_version' },
        { status: 400 }
      );
    }

    // Check if system settings exist
    const { data: existingSettings } = await supabase
      .from('platform_setting')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('platform_setting')
        .update({
          platform_name,
          platform_version,
          default_currency,
          default_language,
          timezone,
          date_format,
          time_format,
          demo_mode,
          maintenance_mode,
          maintenance_message,
          allow_username_login,
          require_email_verification,
          session_timeout,
          max_login_attempts,
          platform_phone,
          platform_whatsapp,
          platform_email,
          platform_website,
          enable_pay_on_delivery,
          enable_online_payment,
          payment_methods,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to update platform settings' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('platform_setting')
        .insert({
          platform_name,
          platform_version,
          default_currency,
          default_language,
          timezone,
          date_format,
          time_format,
          demo_mode,
          maintenance_mode,
          maintenance_message,
          allow_username_login,
          require_email_verification,
          session_timeout,
          max_login_attempts,
          platform_phone,
          platform_whatsapp,
          platform_email,
          platform_website,
          enable_pay_on_delivery,
          enable_online_payment,
          payment_methods
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to create platform settings' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      settings: result
    });

  } catch (error) {
    console.error('Error updating platform settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
