import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeIdsParam = searchParams.get('store_ids');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

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
    const totalSales = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const totalTransactions = sales?.length || 0;
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
        total_sales: totalSales,
        total_transactions: totalTransactions,
        average_order_value: averageOrderValue,
        store_count: storeIds.length
      },
      stores_summary: storesSummary,
      dates_summary: datesSummary,
      sales: sales || []
    });
  } catch (error) {
    console.error('Error in aggregated sales API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
