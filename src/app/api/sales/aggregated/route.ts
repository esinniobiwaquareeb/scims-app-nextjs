import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeIdsParam = searchParams.get('store_ids');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const include_supply_orders = searchParams.get('include_supply_orders') === 'true';

    if (!storeIdsParam) {
      return NextResponse.json(
        { error: 'Store IDs are required' },
        { status: 400 }
      );
    }

    const storeIds = storeIdsParam.split(',').filter(id => id.trim());

    if (storeIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one store ID is required' },
        { status: 400 }
      );
    }

    // Build the sales query
    let salesQuery = supabase
      .from('sale')
      .select(`
        *,
        sale_item(
          quantity,
          unit_price,
          total_price,
          product(
            id,
            name,
            category:category_id(name)
          )
        ),
        customer:customer_id(
          id,
          name,
          phone
        ),
        cashier:user(
          id,
          name,
          username
        ),
        store:store_id(
          id,
          name
        )
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .order('transaction_date', { ascending: false });

    if (startDate) {
      salesQuery = salesQuery.gte('transaction_date', startDate);
    }
    if (endDate) {
      salesQuery = salesQuery.lte('transaction_date', endDate);
    }

    const { data: sales, error: salesError } = await salesQuery;

    if (salesError) {
      console.error('Error fetching aggregated sales:', salesError);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Calculate aggregated statistics
    let totalSales = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    let totalTransactions = sales?.length || 0;
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Group sales by store
    const salesByStore = sales?.reduce((acc, sale) => {
      const storeId = sale.store_id;
      const storeName = sale.store?.name || 'Unknown Store';
      
      if (!acc[storeId]) {
        acc[storeId] = {
          store_id: storeId,
          store_name: storeName,
          sales: [],
          total_sales: 0,
          transaction_count: 0
        };
      }
      
      acc[storeId].sales.push(sale);
      acc[storeId].total_sales += sale.total_amount || 0;
      acc[storeId].transaction_count += 1;
      
      return acc;
    }, {} as Record<string, {
      store_id: string;
      store_name: string;
      sales: typeof sales;
      total_sales: number;
      transaction_count: number;
    }>) || {};

    // Group sales by date
    const salesByDate = sales?.reduce((acc, sale) => {
      const date = new Date(sale.transaction_date).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          total_sales: 0,
          transaction_count: 0
        };
      }
      
      acc[date].total_sales += sale.total_amount || 0;
      acc[date].transaction_count += 1;
      
      return acc;
    }, {} as Record<string, {
      date: string;
      total_sales: number;
      transaction_count: number;
    }>) || {};

    // Fetch supply orders if requested
    interface SupplyOrderTransformed {
      id: string;
      receipt_number: string;
      transaction_type: string;
      total_amount: number;
      transaction_date: string;
      supply_date: string;
      status: string;
      payment_method: string;
      customer?: { id: string; name: string; phone?: string; email?: string };
      cashier?: { id: string; name: string; username: string };
      store?: { id: string; name: string };
      sale_item: Array<{
        quantity: number;
        product?: { id: string; name: string; sku?: string; price: number };
        quantity_supplied: number;
        unit_price: number;
        total_price: number;
        [key: string]: unknown;
      }>;
      is_supply_order: boolean;
      [key: string]: unknown;
    }
    let supplyOrders: SupplyOrderTransformed[] = [];
    if (include_supply_orders) {
      let supplyQuery = supabase
        .from('supply_order')
        .select(`
          *,
          customer:customer_id(
            id,
            name,
            phone,
            email
          ),
          cashier:user(
            id,
            name,
            username
          ),
          store:store_id(
            id,
            name
          ),
          items:supply_order_item(
            *,
            product:product_id(
              id,
              name,
              sku,
              barcode,
              price
            )
          )
        `)
        .in('store_id', storeIds)
        .order('supply_date', { ascending: false });

      if (startDate) supplyQuery = supplyQuery.gte('supply_date', startDate);
      if (endDate) supplyQuery = supplyQuery.lte('supply_date', endDate);

      const { data: supplyData, error: supplyError } = await supplyQuery;
      if (!supplyError && supplyData) {
        // Transform supply orders to match sale structure
        supplyOrders = supplyData.map((order: {
          id: string;
          supply_number: string;
          total_amount: number;
          supply_date: string;
          status: string;
          customer?: { id: string; name: string; phone?: string; email?: string };
          cashier?: { id: string; name: string; username: string };
          store?: { id: string; name: string };
          items?: unknown[];
          [key: string]: unknown;
        }) => ({
          id: order.id,
          receipt_number: order.supply_number,
          transaction_type: 'supply',
          total_amount: order.total_amount,
          transaction_date: order.supply_date,
          supply_date: order.supply_date,
          status: order.status,
          payment_method: 'supply',
          customer: order.customer,
          cashier: order.cashier,
          store: order.store,
          sale_item: (order.items as Array<{
            product?: { id: string; name: string; sku?: string; price: number };
            quantity_supplied: number;
            unit_price: number;
            total_price: number;
            [key: string]: unknown;
          }>)?.map((item) => ({
            ...item,
            quantity: item.quantity_supplied,
            product: item.product
          })) || [],
          is_supply_order: true
        }));

        // Include supply orders in totals
        const supplyTotal = supplyOrders.reduce((sum: number, order: SupplyOrderTransformed) => 
          sum + (order.total_amount || 0), 0);
        totalSales += supplyTotal;
        totalTransactions += supplyOrders.length;
      }
    }

    // Combine sales and supply orders
    const allTransactions = [...(sales || []), ...supplyOrders].sort((a: { transaction_date: string }, b: { transaction_date: string }) => {
      return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
    });

    // Recalculate with combined data
    const combinedTotalSales = allTransactions.reduce((sum: number, t: { total_amount?: number }) => 
      sum + (t.total_amount || 0), 0);
    const combinedTotalTransactions = allTransactions.length;
    const combinedAverageOrderValue = combinedTotalTransactions > 0 ? combinedTotalSales / combinedTotalTransactions : 0;

    // Convert to arrays
    const storesSummary = Object.values(salesByStore);
    const datesSummary = Object.values(salesByDate).sort((a, b) => {
      const aDate = (a as { date: string }).date;
      const bDate = (b as { date: string }).date;
      return aDate.localeCompare(bDate);
    });

    return NextResponse.json({
      success: true,
      summary: {
        total_sales: combinedTotalSales,
        total_transactions: combinedTotalTransactions,
        average_order_value: combinedAverageOrderValue,
        store_count: storeIds.length
      },
      stores_summary: storesSummary,
      dates_summary: datesSummary,
      sales: include_supply_orders ? allTransactions : (sales || [])
    });
  } catch (error) {
    console.error('Error in aggregated sales API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
