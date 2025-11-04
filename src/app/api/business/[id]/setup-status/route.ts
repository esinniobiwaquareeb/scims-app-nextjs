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

    // Check business settings
    const { data: businessSettings } = await supabase
      .from('business_setting')
      .select('*')
      .eq('business_id', businessId)
      .single();

    // Check stores
    const { count: storesCount } = await supabase
      .from('store')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_active', true);

    // Check products
    const { count: productsCount } = await supabase
      .from('product')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_active', true);

    // Check staff
    const { count: staffCount } = await supabase
      .from('user_business_role')
      .select('user_id', { count: 'exact', head: true })
      .eq('business_id', businessId);

    // Check if first sale has been made
    const { count: salesCount } = await supabase
      .from('transaction')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    // Determine setup status
    const setupStatus = {
      businessSettings: !!businessSettings,
      hasStores: (storesCount || 0) > 0,
      hasProducts: (productsCount || 0) > 0,
      hasStaff: (staffCount || 0) > 1, // More than 1 because business admin is counted
      hasFirstSale: (salesCount || 0) > 0,
      storesCount: storesCount || 0,
      productsCount: productsCount || 0,
      staffCount: staffCount || 0,
      salesCount: salesCount || 0
    };

    // Calculate completion percentage
    const completedSteps = [
      setupStatus.businessSettings,
      setupStatus.hasStores,
      setupStatus.hasProducts,
      setupStatus.hasStaff,
      setupStatus.hasFirstSale
    ].filter(Boolean).length;

    const completionPercentage = (completedSteps / 5) * 100;

    // Determine if setup is complete (at least 3 out of 5 critical steps)
    const isSetupComplete = completedSteps >= 3;

    return NextResponse.json({
      success: true,
      setupStatus,
      completionPercentage: Math.round(completionPercentage),
      isSetupComplete,
      completedSteps
    });

  } catch (error: unknown) {
    console.error('Setup status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

