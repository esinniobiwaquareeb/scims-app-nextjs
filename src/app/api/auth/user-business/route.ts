/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch user's business and store information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's business role and related data
    const { data: userBusinessRole, error } = await supabase
      .from('user_business_role')
      .select(`
        business_id,
        store_id,
        business(
          id,
          name,
          subscription_plan_id,
          subscription_status,
          language_id,
          currency_id,
          timezone
        ),
        store(
          id,
          name,
          address,
          language_id,
          currency_id
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user business role:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user business information' },
        { status: 500 }
      );
    }

    if (!userBusinessRole) {
      return NextResponse.json(
        { success: false, error: 'User business role not found' },
        { status: 404 }
      );
    }

    // For business_admin users, fetch all stores for the business
    let allStores: Array<{
      id: string;
      name: string;
      address: string;
      language_id: string | null;
      currency_id: string | null;
    }> = [];
    if (userBusinessRole.business_id) {
      const { data: stores, error: storesError } = await supabase
        .from('store')
        .select(`
          id,
          name,
          address,
          language_id,
          currency_id
        `)
        .eq('business_id', userBusinessRole.business_id)
        .eq('is_active', true);

      if (!storesError && stores) {
        allStores = stores;
      }
    }

    const businessData = {
      business: {
        id: (userBusinessRole.business as any)?.id || userBusinessRole.business_id,
        name: (userBusinessRole.business as any)?.name,
        subscription_status: (userBusinessRole.business as any)?.subscription_status,
        subscription_plan_id: (userBusinessRole.business as any)?.subscription_plan_id,
        language_id: (userBusinessRole.business as any)?.language_id,
        currency_id: (userBusinessRole.business as any)?.currency_id,
        timezone: (userBusinessRole.business as any)?.timezone
      },
      store: (userBusinessRole.store as any) ? {
        id: (userBusinessRole.store as any).id,
        name: (userBusinessRole.store as any).name,
        address: (userBusinessRole.store as any).address,
        language_id: (userBusinessRole.store as any)?.language_id,
        currency_id: (userBusinessRole.store as any)?.currency_id
      } : null,
      allStores: allStores
    };

    return NextResponse.json({
      success: true,
      data: businessData
    });

  } catch (error) {
    console.error('User business API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
