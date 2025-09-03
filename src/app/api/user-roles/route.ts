import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch user roles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const roleId = searchParams.get('role_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('user_role')
      .select(`
        *,
        user(
          id,
          name,
          email,
          username
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
    if (roleId) {
      query = query.eq('role_id', roleId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: userRoles, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userRoles: userRoles || [],
      pagination: {
        limit,
        offset,
        total: userRoles?.length || 0
      }
    });

  } catch (error) {
    console.error('User roles API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.user_id || !body.role_id) {
      return NextResponse.json(
        { success: false, error: 'user_id and role_id are required' },
        { status: 400 }
      );
    }

    const userRoleData = {
      user_id: body.user_id,
      role_id: body.role_id,
      is_active: body.is_active !== undefined ? body.is_active : true,
      assigned_by: body.assigned_by || null,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: userRole, error } = await supabase
      .from('user_role')
      .insert(userRoleData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userRole,
      message: 'User role created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/user-roles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
