import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// PUT - Update a role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.business_id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // First, verify the role exists and belongs to the business
    const { data: existingRole, error: fetchError } = await supabase
      .from('role')
      .select('*')
      .eq('id', id)
      .eq('business_id', body.business_id)
      .single();

    if (fetchError || !existingRole) {
      return NextResponse.json(
        { error: 'Role not found or access denied' },
        { status: 404 }
      );
    }

    // Prevent editing system roles (unless explicitly allowed)
    // Business admins can edit system roles, but we'll let the frontend handle this check
    const updateData: {
      name?: string;
      description?: string;
      permissions?: string[];
      is_active?: boolean;
    } = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.permissions !== undefined) updateData.permissions = body.permissions;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // Update the role
    const { data, error } = await supabase
      .from('role')
      .update(updateData)
      .eq('id', id)
      .eq('business_id', body.business_id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating role:', error);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      role: data
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.business_id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // First, verify the role exists and belongs to the business
    const { data: existingRole, error: fetchError } = await supabase
      .from('role')
      .select('*')
      .eq('id', id)
      .eq('business_id', body.business_id)
      .single();

    if (fetchError || !existingRole) {
      return NextResponse.json(
        { error: 'Role not found or access denied' },
        { status: 404 }
      );
    }

    // Check if the role is in use (has user_role entries)
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_role')
      .select('id')
      .eq('role_id', id)
      .eq('is_active', true)
      .limit(1);

    if (userRolesError) {
      console.error('Error checking user roles:', userRolesError);
      return NextResponse.json(
        { error: 'Failed to check role usage' },
        { status: 500 }
      );
    }

    if (userRoles && userRoles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users. Please remove the role from all users first.' },
        { status: 400 }
      );
    }

    // Prevent deleting system roles (unless explicitly allowed)
    if (existingRole.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false, or hard delete
    // We'll use soft delete to maintain data integrity
    const { error: deleteError } = await supabase
      .from('role')
      .update({ is_active: false })
      .eq('id', id)
      .eq('business_id', body.business_id);

    if (deleteError) {
      console.error('Supabase error deleting role:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

