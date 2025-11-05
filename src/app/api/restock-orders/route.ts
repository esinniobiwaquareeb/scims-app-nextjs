import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Fetch restock orders for the store
    const { data: orders, error } = await supabase
      .from('restock_order')
      .select(`
        *,
        supplier:supplier_id(
          id,
          name,
          contact_person,
          phone
        ),
        items:restock_item(
          *,
          product:product_id(
            id,
            name,
            sku,
            stock_quantity,
            reorder_level
          )
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restock orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch restock orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('Error in restock orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_id, supplier_id, status, total_amount, notes, expected_delivery, items, created_by } = body;

    if (!store_id || !supplier_id || !status || !total_amount || !items || !created_by) {
      return NextResponse.json(
        { error: 'Store ID, supplier ID, status, total amount, items, and created_by are required' },
        { status: 400 }
      );
    }

    // Convert empty strings to null for optional fields
    const expectedDeliveryValue = expected_delivery && expected_delivery.trim() !== '' 
      ? expected_delivery 
      : null;
    const notesValue = notes && notes.trim() !== '' ? notes : null;

    // Create the restock order
    const { data: order, error: orderError } = await supabase
      .from('restock_order')
      .insert({
        store_id,
        supplier_id,
        status,
        total_amount,
        notes: notesValue,
        expected_delivery: expectedDeliveryValue,
        created_by
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating restock order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create restock order' },
        { status: 500 }
      );
    }

    // Create restock items
    if (items && items.length > 0) {
      const restockItems = items.map((item: { product_id: string; quantity: number; unit_cost: number }) => ({
        restock_order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost
      }));

      const { error: itemsError } = await supabase
        .from('restock_item')
        .insert(restockItems);

      if (itemsError) {
        console.error('Error creating restock items:', itemsError);
        // Clean up the order if items creation fails
        await supabase.from('restock_order').delete().eq('id', order.id);
        return NextResponse.json(
          { error: 'Failed to create restock items' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Error creating restock order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
