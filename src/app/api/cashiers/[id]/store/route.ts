import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cashierId } = await params;
    const body = await request.json();
    const { store_id } = body;

    if (!cashierId) {
      return NextResponse.json(
        { error: 'Cashier ID is required' },
        { status: 400 }
      );
    }

    // First, check if the cashier is currently assigned to a different store
    const { data: currentAssignment, error: checkError } = await supabase
      .from('user_business_role')
      .select('store_id, business_id')
      .eq('user_id', cashierId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking current assignment:', checkError);
      return NextResponse.json(
        { error: 'Failed to check current assignment' },
        { status: 500 }
      );
    }

    const currentStoreId = currentAssignment?.store_id;
    const businessId = currentAssignment?.business_id;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Cashier not found in business' },
        { status: 404 }
      );
    }

    // Update the store_id in user_business_role table
    const { error } = await supabase
      .from('user_business_role')
      .update({ store_id })
      .eq('user_id', cashierId)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error updating cashier store:', error);
      return NextResponse.json(
        { error: 'Failed to update cashier store assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      previousStoreId: currentStoreId,
      newStoreId: store_id,
      message: 'Cashier store assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating cashier store:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
