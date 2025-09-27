/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Store ID is optional - if not provided, get all stores for the business
    const businessId = searchParams.get('business_id');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Get sales data for the store(s) within the date range
    let salesQuery = supabase
      .from('sale')
      .select(`
        total_amount,
        created_at,
        payment_method,
        store_id,
        items:sale_item(
          quantity,
          unit_price,
          product:product(
            cost
          )
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (storeId) {
      // Filter by specific store
      salesQuery = salesQuery.eq('store_id', storeId);
    } else {
      // Get all stores for the business
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId);
      
      if (stores && stores.length > 0) {
        const storeIds = stores.map(store => store.id);
        salesQuery = salesQuery.in('store_id', storeIds);
      } else {
        return NextResponse.json({
          success: true,
          data: {
            totalRevenue: 0,
            totalCOGS: 0,
            totalProfit: 0,
            profitMargin: 0,
            revenueGrowth: 0
          }
        });
      }
    }

    const { data: sales, error: salesError } = await salesQuery;

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Calculate financial metrics
    const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    
    // Calculate total cost of goods sold
    const totalCOGS = sales?.reduce((sum, sale) => {
      const saleCOGS = sale.items?.reduce((itemSum: number, item: any) => {
        const costPrice = item.product?.cost || 0;
        return itemSum + (item.quantity * costPrice);
      }, 0) || 0;
      return sum + saleCOGS;
    }, 0) || 0;

    const totalProfit = totalRevenue - totalCOGS;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculate revenue growth (compare with previous period)
    const previousStartDate = new Date(new Date(startDate).getTime() - (new Date(endDate).getTime() - new Date(startDate).getTime()));
    const previousEndDate = new Date(startDate);

    const { data: previousSales } = await supabase
      .from('sale')
      .select('total_amount')
      .eq('store_id', storeId)
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', previousEndDate.toISOString());

    const previousRevenue = previousSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate expenses (simplified - in a real system, you'd have an expenses table)
    const estimatedExpenses = totalRevenue * 0.3; // Assume 30% of revenue as expenses
    const expenseGrowth = previousRevenue > 0 ? ((estimatedExpenses - (previousRevenue * 0.3)) / (previousRevenue * 0.3)) * 100 : 0;

    const financialMetrics = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalExpenses: Math.round(estimatedExpenses * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      expenseGrowth: Math.round(expenseGrowth * 100) / 100,
      totalCOGS: Math.round(totalCOGS * 100) / 100,
      netProfit: Math.round((totalProfit - estimatedExpenses) * 100) / 100
    };

    return NextResponse.json({
      success: true,
      data: financialMetrics,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Error in financial metrics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
