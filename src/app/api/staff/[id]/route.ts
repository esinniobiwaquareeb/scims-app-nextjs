import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch specific staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', staffId)
      .single();

    if (error) throw error;

    // Get store assignment
    const { data: userRole, error: roleError } = await supabase
      .from('user_business_role')
      .select(`
        store_id,
        store:store_id(
          id,
          name
        )
      `)
      .eq('user_id', staffId)
      .single();

    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error fetching user role:', roleError);
    }

    const staffMember = {
      ...user,
      store_id: userRole?.store_id,
      storeName: userRole?.store ? (userRole.store as { name: string }[])[0]?.name : null
    };

    return NextResponse.json({
      success: true,
      staff: staffMember
    });

  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch staff member' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update a staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const body = await request.json();

    if (!staffId) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Update the user record
    const { data: userData, error: userError } = await supabase
      .from('user')
      .update({
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        role: body.role || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId)
      .select()
      .single();

    if (userError) {
      console.error('Supabase error updating user:', userError);
      return NextResponse.json(
        { error: 'Failed to update staff member' },
        { status: 500 }
      );
    }

    // First, let's check what user_business_role records exist for this user
    const { data: existingRoles, error: fetchRolesError } = await supabase
      .from('user_business_role')
      .select('*')
      .eq('user_id', staffId);

    if (fetchRolesError) {
      console.error('Error fetching existing user roles:', fetchRolesError);
    } else {
      console.log('Existing user roles for staff:', {
        staffId,
        existingRoles,
        businessId: body.business_id
      });
    }

    // Update the user_business_role store assignment
    // Filter by both user_id and business_id to ensure we're updating the correct record
    const { data: updateResult, error: roleError } = await supabase
      .from('user_business_role')
      .update({
        store_id: body.store_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', staffId)
      .eq('business_id', body.business_id)
      .select();

    if (roleError) {
      console.error('Supabase error updating user role:', roleError);
      return NextResponse.json(
        { error: 'Failed to update staff store assignment' },
        { status: 500 }
      );
    }

    // Debug logging
    console.log('Staff store assignment updated:', {
      staffId,
      storeId: body.store_id,
      businessId: body.business_id,
      updateResult
    });

    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;

    if (!staffId) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    // Deactivate the user (soft delete)
    const { error: userError } = await supabase
      .from('user')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId);

    if (userError) {
      console.error('Supabase error deactivating user:', userError);
      return NextResponse.json(
        { error: 'Failed to delete staff member' },
        { status: 500 }
      );
    }

    // Also deactivate the user_business_role
    const { error: roleError } = await supabase
      .from('user_business_role')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('user_id', staffId);

    if (roleError) {
      console.error('Supabase error updating user role:', roleError);
      // Don't fail the entire operation if role update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
