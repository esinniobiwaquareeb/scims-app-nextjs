import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch roles
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

    // Fetch all roles for the business (both system and custom)
    // The UI will handle displaying them with appropriate badges and edit permissions
    const { data: roles, error } = await supabase
      .from('role')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('is_system_role', { ascending: false }) // System roles first
      .order('name');

    if (error) {
      console.error('Supabase error fetching roles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roles: roles || []
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.business_id) {
      return NextResponse.json(
        { error: 'Name and business_id are required' },
        { status: 400 }
      );
    }

    // Create the role
    const { data, error } = await supabase
      .from('role')
      .insert({
        name: body.name,
        description: body.description || null,
        permissions: body.permissions || [],
        business_id: body.business_id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating role:', error);
      return NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
