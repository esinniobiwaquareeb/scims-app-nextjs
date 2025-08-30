import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
        role,
        created_at,
        updated_at,
        user:user(id, email, first_name, last_name)
      `)
      .eq('business_id', businessId);

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
