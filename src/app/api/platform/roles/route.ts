import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch platform roles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('platform_role')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: roles, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch platform roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roles: roles || [],
      pagination: {
        limit,
        offset,
        total: roles?.length || 0
      }
    });

  } catch (error) {
    console.error('Platform roles API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new platform role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, error: 'name and description are required' },
        { status: 400 }
      );
    }

    const roleData = {
      name: body.name,
      description: body.description,
      permissions: body.permissions || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: role, error } = await supabase
      .from('platform_role')
      .insert(roleData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create platform role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      role,
      message: 'Platform role created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/platform/roles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
