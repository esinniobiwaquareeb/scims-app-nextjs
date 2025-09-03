import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch user business roles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const businessId = searchParams.get('business_id');
    const roleId = searchParams.get('role_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('user_business_role')
      .select(`
        *,
        user(
          id,
          name,
          email,
          username
        ),
        business(
          id,
          name,
          business_type
        ),
        role(
          id,
          name,
          description,
          permissions
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (roleId) {
      query = query.eq('role_id', roleId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: userBusinessRoles, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user business roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userBusinessRoles: userBusinessRoles || [],
      pagination: {
        limit,
        offset,
        total: userBusinessRoles?.length || 0
      }
    });

  } catch (error) {
    console.error('User business roles API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user business role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.user_id || !body.business_id || !body.role_id) {
      return NextResponse.json(
        { success: false, error: 'user_id, business_id, and role_id are required' },
        { status: 400 }
      );
    }

    const userBusinessRoleData = {
      user_id: body.user_id,
      business_id: body.business_id,
      role_id: body.role_id,
      is_active: body.is_active !== undefined ? body.is_active : true,
      assigned_by: body.assigned_by || null,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: userBusinessRole, error } = await supabase
      .from('user_business_role')
      .insert(userBusinessRoleData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create user business role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userBusinessRole,
      message: 'User business role created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/user-business-roles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
