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
          subscription_status
        ),
        store(
          id,
          name,
          address
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

    // Transform the data to match the expected structure
    // Handle the case where joined tables return arrays
    const businessData = {
      business: {
        id: userBusinessRole.business?.[0]?.id || userBusinessRole.business_id,
        name: userBusinessRole.business?.[0]?.name,
        subscription_status: userBusinessRole.business?.[0]?.subscription_status,
        subscription_plan_id: userBusinessRole.business?.[0]?.subscription_plan_id
      },
      store: userBusinessRole.store?.[0] ? {
        id: userBusinessRole.store[0].id,
        name: userBusinessRole.store[0].name,
        address: userBusinessRole.store[0].address
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
