import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { CreateSupplyOrderData } from '@/types/supply';

// GET - Fetch supply orders
export async function GET(request: NextRequest) {
    try {
    const { searchParams } = new URL(request.url);
    
    const storeId = searchParams.get('store_id');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
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
      .order('supply_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: supplyOrders, error } = await query;

    if (error) {
      console.error('Error fetching supply orders:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch supply orders' },
        { status: 500 }
      );
    }

    // Transform the data to match SupplyOrderSummary interface
    const transformedOrders = (supplyOrders || []).map(order => ({
      ...order,
      customer_name: order.customer?.name || 'Unknown Customer',
      customer_phone: order.customer?.phone || 'N/A',
      cashier_name: order.cashier?.name || 'Unknown Cashier',
      store_name: order.store?.name || 'Unknown Store',
      total_items: order.items?.length || 0,
      total_quantity_supplied: order.items?.reduce((sum: number, item: { quantity_supplied: number; quantity_returned: number; quantity_accepted: number }) => sum + item.quantity_supplied, 0) || 0,
      total_quantity_returned: order.items?.reduce((sum: number, item: { quantity_supplied: number; quantity_returned: number; quantity_accepted: number }) => sum + item.quantity_returned, 0) || 0,
      total_quantity_accepted: order.items?.reduce((sum: number, item: { quantity_supplied: number; quantity_returned: number; quantity_accepted: number }) => sum + item.quantity_accepted, 0) || 0
    }));

    return NextResponse.json({
      success: true,
      supply_orders: transformedOrders
    });

  } catch (error) {
    console.error('Error in GET /api/supply-orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new supply order
export async function POST(request: NextRequest) {
  try {
    const supplyData: CreateSupplyOrderData = await request.json();

    // Validate required fields
    if (!supplyData.store_id || !supplyData.customer_id || !supplyData.cashier_id || !supplyData.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = supplyData.items.reduce((sum, item) => sum + (item.quantity_supplied * item.unit_price), 0);
    
    // Get store settings to determine discount rate
    const { data: storeSettings } = await supabase
      .from('store_setting')
      .select('enable_discount, discount_rate')
      .eq('store_id', supplyData.store_id)
      .single();
    
    // Get business settings as fallback
    const { data: businessSettings } = await supabase
      .from('business_setting')
      .select('enable_discount, discount_rate')
      .eq('business_id', (await supabase
        .from('store')
        .select('business_id')
        .eq('id', supplyData.store_id)
        .single()
      ).data?.business_id)
      .single();
    
    // Determine discount rate (store overrides business)
    let discountRate = 0;
    if (storeSettings?.enable_discount) {
      discountRate = storeSettings.discount_rate || 0;
    } else if (businessSettings?.enable_discount) {
      discountRate = businessSettings.discount_rate || 0;
    }
    
    const discountAmount = subtotal * (discountRate / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = 0; // You can implement tax calculation logic here
    const totalAmount = discountedSubtotal + taxAmount;

    // Generate supply number using JavaScript (database function has ambiguous column reference)
    const currentYear = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const finalSupplyNumber = `SUP-${timestamp}-${currentYear}`;

    // Create supply order
    const { data: supplyOrder, error: orderError } = await supabase
      .from('supply_order')
      .insert({
        store_id: supplyData.store_id,
        customer_id: supplyData.customer_id,
        cashier_id: supplyData.cashier_id,
        supply_number: finalSupplyNumber,
        status: 'supplied',
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: supplyData.notes,
        expected_return_date: supplyData.expected_return_date
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating supply order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create supply order' },
        { status: 500 }
      );
    }

    // Create supply order items
    const supplyOrderItems = supplyData.items.map(item => ({
      supply_order_id: supplyOrder.id,
      product_id: item.product_id,
      quantity_supplied: item.quantity_supplied,
      quantity_returned: 0,
      quantity_accepted: 0,
      unit_price: item.unit_price,
      total_price: item.quantity_supplied * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('supply_order_item')
      .insert(supplyOrderItems);

    if (itemsError) {
      console.error('Error creating supply order items:', itemsError);
      // Rollback supply order creation
      await supabase.from('supply_order').delete().eq('id', supplyOrder.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create supply order items' },
        { status: 500 }
      );
    }

    // Fetch the complete supply order with related data
    const { data: completeSupplyOrder, error: fetchError } = await supabase
      .from('supply_order')
      .select(`
        *,
        customer:customer_id(name, phone, email),
        cashier:cashier_id(name, username),
        store:store_id(name),
        items:supply_order_item(
          *,
          product:product_id(name, sku, barcode, price, stock_quantity, image_url)
        )
      `)
      .eq('id', supplyOrder.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete supply order:', fetchError);
    }

    return NextResponse.json({
      success: true,
      supply_order: completeSupplyOrder || supplyOrder
    });

  } catch (error) {
    console.error('Error in POST /api/supply-orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
