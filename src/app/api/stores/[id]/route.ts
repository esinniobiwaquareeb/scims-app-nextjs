import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Fetch store details with related data
    const { data: store, error } = await supabase
      .from('store')
      .select(`
        *,
        business:business_id(id, name),
        language:language_id(id, name, code),
        currency:currency_id(id, name, symbol, code),
        country:country_id(id, name, code)
      `)
      .eq('id', storeId)
      .single();

    if (error) {
      console.error('Error fetching store:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch store details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      store,
      success: true
    });

  } catch (error) {
    console.error('Unexpected error in store detail API:', error);
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
    const { id: storeId } = await params;
    const body = await request.json();

    // Define valid store columns based on the database schema
    const validStoreColumns = [
      'name', 'address', 'city', 'state', 'postal_code', 'phone', 'email',
      'manager_name', 'is_active', 'currency_id', 'language_id', 'country_id'
    ];

    // Filter the body to only include valid store columns
    const filteredBody = Object.keys(body).reduce((acc: Record<string, unknown>, key) => {
      if (validStoreColumns.includes(key)) {
        // Convert empty strings to null for UUID fields
        if (key === 'country_id' || key === 'currency_id' || key === 'language_id') {
          acc[key] = body[key] === '' ? null : body[key];
        } else {
          acc[key] = body[key];
        }
      }
      return acc;
    }, {} as Record<string, unknown>);



    const { data: store, error } = await supabase
      .from('store')
      .update(filteredBody)
      .eq('id', storeId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update store' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      store
    });

  } catch (error) {
    console.error('Store API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;

    const { error } = await supabase
      .from('store')
      .delete()
      .eq('id', storeId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete store' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully'
    });

  } catch (error) {
    console.error('Store API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
