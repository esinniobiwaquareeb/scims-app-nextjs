import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cashierId } = await params;

    if (!cashierId) {
      return NextResponse.json(
        { error: 'Cashier ID is required' },
        { status: 400 }
      );
    }

    // Get the cashier data first
    const { data: cashier, error: cashierError } = await supabase
      .from('user')
      .select('*')
      .eq('id', cashierId)
      .eq('role', 'cashier')
      .single();

    if (cashierError) {
      console.error('Error fetching cashier:', cashierError);
      return NextResponse.json(
        { error: 'Cashier not found' },
        { status: 404 }
      );
    }

    // Get the user's business role to find store_id
    const { data: userRole, error: roleError } = await supabase
      .from('user_business_role')
      .select('store_id')
      .eq('user_id', cashierId)
      .single();

    if (roleError) {
      console.error('Error fetching user role:', roleError);
      // Continue without store_id if role not found
    }

    if (cashierError) {
      console.error('Error fetching cashier:', cashierError);
      return NextResponse.json(
        { error: 'Cashier not found' },
        { status: 404 }
      );
    }

    // Get store information separately if store_id exists
    let storeInfo = null;
    if (cashier.store_id) {
      const { data: store, error: storeError } = await supabase
        .from('store')
        .select('id, name, address')
        .eq('id', cashier.store_id)
        .single();
      
      if (!storeError && store) {
        storeInfo = store;
      }
    }

    // Combine cashier and store data
    const cashierWithStore = {
      ...cashier,
      store_id: userRole?.store_id || null,
      store: storeInfo
    };

    return NextResponse.json({
      success: true,
      cashier: cashierWithStore
    });
  } catch (error) {
    console.error('Error fetching cashier:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cashierId } = await params;
    const body = await request.json();
    const { name, username, email, phone, is_active } = body;

    if (!cashierId) {
      return NextResponse.json(
        { error: 'Cashier ID is required' },
        { status: 400 }
      );
    }

    // Update the user
    const { data: user, error: userError } = await supabase
      .from('user')
      .update({
        name,
        username: username?.toLowerCase(),
        email,
        phone,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', cashierId)
      .eq('role', 'cashier')
      .select()
      .single();

    if (userError) {
      console.error('Error updating cashier:', userError);
      return NextResponse.json(
        { error: 'Failed to update cashier' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating cashier:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cashierId } = await params;

    if (!cashierId) {
      return NextResponse.json(
        { error: 'Cashier ID is required' },
        { status: 400 }
      );
    }

    // First delete the user-business role relationship
    const { error: roleError } = await supabase
      .from('user_business_role')
      .delete()
      .eq('user_id', cashierId);

    if (roleError) {
      console.error('Error deleting user-business role:', roleError);
      return NextResponse.json(
        { error: 'Failed to delete user-business role' },
        { status: 500 }
      );
    }

    // Then delete the user
    const { error: userError } = await supabase
      .from('user')
      .delete()
      .eq('id', cashierId)
      .eq('role', 'cashier');

    if (userError) {
      console.error('Error deleting user:', userError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cashier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cashier:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
