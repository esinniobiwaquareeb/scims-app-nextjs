import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// PUT - Update a supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;
    const body = await request.json();

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.name || !body.business_id) {
      return NextResponse.json(
        { error: 'Name and business_id are required' },
        { status: 400 }
      );
    }

    // Update the supplier
    const { data, error } = await supabase
      .from('supplier')
      .update({
        name: body.name,
        contact_person: body.contact_person || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', supplierId)
      .eq('business_id', body.business_id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating supplier:', error);
      return NextResponse.json(
        { error: 'Failed to update supplier' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Delete the supplier
    const { error } = await supabase
      .from('supplier')
      .delete()
      .eq('id', supplierId)
      .eq('business_id', businessId);

    if (error) {
      console.error('Supabase error deleting supplier:', error);
      return NextResponse.json(
        { error: 'Failed to delete supplier' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
