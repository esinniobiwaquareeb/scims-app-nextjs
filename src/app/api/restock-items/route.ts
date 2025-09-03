import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch restock items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const restockOrderId = searchParams.get('restock_order_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('restock_item')
      .select(`
        *,
        product(
          id,
          name,
          sku,
          barcode,
          description,
          price,
          image_url
        ),
        restock_order(
          id,
          order_number,
          status,
          supplier_id
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    if (restockOrderId) {
      query = query.eq('restock_order_id', restockOrderId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: restockItems, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch restock items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      restockItems: restockItems || [],
      pagination: {
        limit,
        offset,
        total: restockItems?.length || 0
      }
    });

  } catch (error) {
    console.error('Restock items API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new restock item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.restock_order_id || !body.product_id || !body.quantity_ordered) {
      return NextResponse.json(
        { success: false, error: 'restock_order_id, product_id, and quantity_ordered are required' },
        { status: 400 }
      );
    }

    const restockItemData = {
      restock_order_id: body.restock_order_id,
      product_id: body.product_id,
      quantity_ordered: body.quantity_ordered,
      quantity_received: body.quantity_received || 0,
      unit_cost: body.unit_cost || 0,
      total_cost: body.total_cost || 0,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: restockItem, error } = await supabase
      .from('restock_item')
      .insert(restockItemData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create restock item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      restockItem,
      message: 'Restock item created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/restock-items:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
