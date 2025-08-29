import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Debug: Check what's in user_business_role for this business
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_business_role')
      .select('*')
      .eq('business_id', businessId);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return NextResponse.json(
        { error: 'Failed to fetch user roles', details: rolesError },
        { status: 500 }
      );
    }

    // Debug: Check what users exist with cashier role
    const { data: cashierUsers, error: usersError } = await supabase
      .from('user')
      .select('id, username, name, role, is_active')
      .eq('role', 'cashier');

    if (usersError) {
      console.error('Error fetching cashier users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch cashier users', details: usersError },
        { status: 500 }
      );
    }

    // Debug: Check what's in the business table
    const { data: business, error: businessError } = await supabase
      .from('business')
      .select('id, name')
      .eq('id', businessId)
      .single();

    if (businessError) {
      console.error('Error fetching business:', businessError);
      return NextResponse.json(
        { error: 'Failed to fetch business', details: businessError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      debug: {
        business,
        userRolesFound: userRoles?.length || 0,
        userRoles: userRoles || [],
        cashierUsersFound: cashierUsers?.length || 0,
        cashierUsers: cashierUsers || [],
        businessId
      }
    });
  } catch (error) {
    console.error('Error in debug cashiers API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
