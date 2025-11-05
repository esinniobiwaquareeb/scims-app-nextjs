import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Assign a role to a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.user_id || !body.role_id || !body.business_id) {
      return NextResponse.json(
        { error: 'user_id, role_id, and business_id are required' },
        { status: 400 }
      );
    }

    // Check if user_role already exists for this user and business
    const { data: existingUserRole, error: checkError } = await supabase
      .from('user_role')
      .select('*')
      .eq('user_id', body.user_id)
      .eq('business_id', body.business_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing user role:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing role assignment' },
        { status: 500 }
      );
    }

    let userRole;

    if (existingUserRole) {
      // Update existing user_role
      const { data, error } = await supabase
        .from('user_role')
        .update({
          role_id: body.role_id,
          store_id: body.store_id || null,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUserRole.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating user role:', error);
        return NextResponse.json(
          { error: 'Failed to update user role' },
          { status: 500 }
        );
      }

      userRole = data;
    } else {
      // Create new user_role
      const { data, error } = await supabase
        .from('user_role')
        .insert({
          user_id: body.user_id,
          role_id: body.role_id,
          business_id: body.business_id,
          store_id: body.store_id || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating user role:', error);
        return NextResponse.json(
          { error: 'Failed to assign role to user' },
          { status: 500 }
        );
      }

      userRole = data;
    }

    return NextResponse.json({
      success: true,
      userRole,
      message: 'Role assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

