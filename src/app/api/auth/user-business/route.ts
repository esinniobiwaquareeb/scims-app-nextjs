/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

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

    console.log('userBusinessRole ==> ', userBusinessRole);
    // Transform the data to match the expected structure
    // Handle the case where joined tables return objects
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
      } : null
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
