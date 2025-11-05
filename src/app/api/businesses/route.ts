import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';
import { EmailService } from '@/lib/email/emailService';
import { generateSecurePassword } from '@/utils/passwordGenerator';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch all businesses (for superadmin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: businesses, error } = await supabase
      .from('business')
      .select(`
        *,
        store(*),
        subscription_plan(*),
        country(*),
        currency(*),
        language(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform the data to match the expected interface
    const transformedBusinesses = (businesses || []).map((business: {
      id: string;
      name: string;
      subscription_plan?: {
        id: string;
        name: string;
        price: number;
        features: string[];
        [key: string]: unknown;
      };
      store?: Array<{
        id: string;
        name: string;
        address: string;
        is_active: boolean;
        [key: string]: unknown;
      }>;
      country?: {
        id: string;
        name: string;
        code: string;
        [key: string]: unknown;
      };
      currency?: {
        id: string;
        name: string;
        code: string;
        symbol: string;
        [key: string]: unknown;
      };
      language?: {
        id: string;
        name: string;
        code: string;
        native_name: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }) => ({
      ...business,
      subscription_plans: business.subscription_plan, // Map to plural for component
      stores: business.store || [], // Map to plural for component
      country: business.country, // Country data
      currency: business.currency, // Currency data
      language: business.language // Language data
    }));

    return NextResponse.json({
      success: true,
      businesses: transformedBusinesses,
      pagination: {
        limit,
        offset,
        total: transformedBusinesses.length
      }
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch businesses' 
      },
      { status: 500 }
    );
  }
}

// POST - Create new business
export async function POST(request: NextRequest) {
  try {
    const businessData = await request.json();

    // Start a transaction by creating the business first
    const { data: business, error: businessError } = await supabase
      .from('business')
      .insert(businessData)
      .select()
      .single();

    if (businessError) throw businessError;

    // Generate a secure password for the business admin
    const defaultPassword = generateSecurePassword(16);
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Create business admin user account
    const businessAdminData = {
      username: businessData.username || `admin.${business.name.toLowerCase().replace(/\s+/g, '.')}`,
      email: businessData.email,
      name: `${business.name} Administrator`,
      password_hash: passwordHash,
      role: 'business_admin',
      is_active: true,
      is_demo: false, // Real business users are not demo users
      email_verified: true // Auto-verify admin users created by superadmin
    };

    const { data: user, error: userError } = await supabase
      .from('user')
      .insert(businessAdminData)
      .select()
      .single();

    if (userError) throw userError;

    // Create a default store for the business
    const defaultStoreData = {
      name: `${business.name} Main Store`,
      address: businessData.address || 'Address to be updated',
      business_id: business.id,
      currency_id: businessData.currency_id,
      language_id: businessData.language_id,
      country_id: businessData.country_id,
      is_active: true
    };

    const { data: store, error: storeError } = await supabase
      .from('store')
      .insert(defaultStoreData)
      .select()
      .single();

    if (storeError) throw storeError;

    // Create a default store setting
    const { data: storeSetting, error: storeSettingError } = await supabase
      .from('store_setting')
      .insert({
        store_id: store.id,
      });

    if (storeSettingError) throw storeSettingError;

    // Create user-business role relationship with the default store
    const { error: roleError } = await supabase
      .from('user_business_role')
      .insert({
        user_id: user.id,
        business_id: business.id,
        store_id: store.id
      });

    if (roleError) throw roleError;

    // Step 1: Copy platform roles to this business
    const { error: roleCopyError } = await supabase
      .rpc('assign_platform_roles_to_business', { business_uuid: business.id });

    if (roleCopyError) {
      console.warn('Failed to copy platform roles:', roleCopyError);
      // Don't fail the entire operation if role assignment fails
    } else {
      // Step 2: Now get the business-specific business_admin role
      const { data: businessAdminRole, error: roleQueryError } = await supabase
        .from('role')
        .select('id')
        .eq('name', 'business_admin')
        .eq('business_id', business.id)
        .single();

      if (roleQueryError) {
        console.warn('Failed to find business_admin role:', roleQueryError);
        // Don't fail the entire operation if role assignment fails
      } else {
        // Step 3: Create user-role relationship
        const { error: userRoleError } = await supabase
          .from('user_role')
          .insert({
            user_id: user.id,
            role_id: businessAdminRole.id,
            business_id: business.id,
            store_id: store.id
          });

        if (userRoleError) {
          console.warn('Failed to create user-role relationship:', userRoleError);
          // Don't fail the entire operation if role assignment fails
        }
      }
    }

    // Create default business settings
    const defaultSettingsData = {
      business_id: business.id,
      tax_rate: 0.00,
      enable_tax: false,
      allow_returns: true,
      return_period_days: 30,
      enable_sounds: true,
      logo_url: null,
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      accent_color: '#F59E0B',
      receipt_header: 'Thank you for shopping with us!',
      receipt_footer: 'Returns accepted within 30 days with receipt.',
      return_policy: 'Returns accepted within 30 days with original receipt.',
      warranty_info: 'Standard manufacturer warranty applies.',
      terms_of_service: null,
      privacy_policy: null,
      business_type: 'retail',
      enable_stock_tracking: true,
      enable_inventory_alerts: true,
      enable_restock_management: true,
      enable_recipe_management: false,
      enable_service_booking: false,
      enable_menu_management: false,
      enable_ingredient_tracking: false
    };

    const { error: settingsError } = await supabase
      .from('business_setting')
      .insert(defaultSettingsData);

    if (settingsError) {
      console.warn('Failed to create business settings:', settingsError);
      // Don't fail the entire operation if settings creation fails
    }

    // Send welcome email to the business admin
    try {
      const platformUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scims.app';
      const loginUrl = `${platformUrl}/auth/login`;
      const supportEmail = process.env.SUPPORT_EMAIL || 'support@scims.app';

      const emailResult = await EmailService.sendWelcomeEmail({
        businessName: business.name,
        businessEmail: businessData.email,
        adminName: businessAdminData.name,
        adminUsername: businessAdminData.username,
        adminPassword: defaultPassword,
        platformUrl,
        loginUrl,
        supportEmail
      });

      if (!emailResult.success) {
        console.warn('Failed to send welcome email:', emailResult.error);
        // Don't fail the entire operation if email fails
      } else {
        console.log('Welcome email sent successfully to:', businessData.email);
      }
    } catch (emailError) {
      console.warn('Error sending welcome email:', emailError);
      // Don't fail the entire operation if email fails
    }

    // Return the created business with user and store info
    return NextResponse.json({
      success: true,
      business: {
        ...business,
        admin_user: {
          id: user.id,
          username: user.username,
          email: user.email,
          default_password: defaultPassword
        },
        default_store: {
          id: store.id,
          name: store.name,
          address: store.address
        },
        store_setting: storeSetting
      }
    });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create business' 
      },
      { status: 500 }
    );
  }
}
