import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'business_id is required' },
        { status: 400 }
      );
    }

    // Fetch user roles for the specified business
    const { data: userRoles, error } = await supabase
      .from('user_role')
      .select(`
        id,
        user_id,
        business_id,
        role_id,
        store_id,
        assigned_at,
        is_active,
        user:user(id, email, name, username, role),
        role:role(id, name, description)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userRoles: userRoles || []
    });

  } catch (error) {
    console.error('User roles API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
