import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch pending returns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const storeId = searchParams.get('store_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Get supply orders that have pending returns (status is 'supplied' or 'partially_returned')
    const { data: pendingReturns, error } = await supabase
      .from('supply_order')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          email,
          phone
        ),
        cashier:cashier_id (
          id,
          name,
          username
        ),
        store:store_id (
          id,
          name
        ),
        items:supply_order_item (
          id,
          quantity_supplied,
          quantity_returned,
          quantity_accepted
        )
      `)
      .eq('store_id', storeId)
      .in('status', ['supplied', 'partially_returned'])
      .order('expected_return_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching pending returns:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending returns' },
        { status: 500 }
      );
    }

    // Transform the data to match PendingReturn interface
    const transformedReturns = (pendingReturns || []).map(order => ({
      supply_order_id: order.id,
      supply_number: order.supply_number,
      customer_name: order.customer?.name || 'Unknown Customer',
      customer_phone: order.customer?.phone || 'N/A',
      supply_date: order.supply_date,
      expected_return_date: order.expected_return_date,
      items_pending_return: order.items?.length || 0,
      total_quantity_pending: order.items?.reduce((sum: number, item: { quantity_supplied: number; quantity_returned: number; quantity_accepted: number }) => sum + (item.quantity_supplied - item.quantity_returned - item.quantity_accepted), 0) || 0
    }));

    return NextResponse.json({
      success: true,
      pending_returns: transformedReturns
    });

  } catch (error) {
    console.error('Error in GET /api/supply-orders/pending-returns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
