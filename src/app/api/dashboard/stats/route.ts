import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters
    const store_id = searchParams.get('store_id');
    const business_id = searchParams.get('business_id');
    const type = searchParams.get('type'); // 'store' or 'business'

    if (type === 'store' && store_id) {
      // Get store-specific stats
      const stats = await getStoreDashboardStats(store_id);
      return NextResponse.json({
        success: true,
        stats,
        type: 'store'
      });
    } else if (type === 'business' && business_id) {
      // Get business-wide stats
      const stats = await getBusinessDashboardStats(business_id);
      return NextResponse.json({
        success: true,
        stats,
        type: 'business'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid parameters. Must specify type (store/business) and corresponding ID.' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' 
      },
      { status: 500 }
    );
  }
}

// Get store dashboard stats
async function getStoreDashboardStats(storeId: string) {
  // Get today's date in local timezone
  const today = new Date();
  const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
  const startOfDay = new Date(localToday.getFullYear(), localToday.getMonth(), localToday.getDate());
  const endOfDay = new Date(localToday.getFullYear(), localToday.getMonth(), localToday.getDate(), 23, 59, 59);
  
  // Convert to ISO strings for database query
  const startOfDayISO = startOfDay.toISOString();
  const endOfDayISO = endOfDay.toISOString();

  // Get today's sales
  const { data: todaySales, error: salesError } = await supabase
    .from('sale')
    .select('total_amount')
    .eq('store_id', storeId)
    .eq('status', 'completed')
    .gte('transaction_date', startOfDayISO)
    .lte('transaction_date', endOfDayISO);

  if (salesError) throw salesError;

  // Get product count
  const { count: productsCount, error: productsError } = await supabase
    .from('product')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('is_active', true);

  if (productsError) throw productsError;

  // Get low stock count - fetch all products and filter by reorder level
  const { data: allProducts, error: lowStockError } = await supabase
    .from('product')
    .select('stock_quantity, reorder_level, min_stock_level')
    .eq('store_id', storeId)
    .eq('is_active', true);

  if (lowStockError) throw lowStockError;

  // Filter products that are below their reorder level (same logic as ProductManagement)
  const lowStockProducts = (allProducts || []).filter(product => 
    (product.stock_quantity || 0) <= (product.reorder_level || product.min_stock_level || 10)
  );

  // Get today's orders count
  const { count: ordersCount, error: ordersError } = await supabase
    .from('sale')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('status', 'completed')
    .gte('transaction_date', startOfDayISO)
    .lte('transaction_date', endOfDayISO);

  if (ordersError) throw ordersError;

  return {
    sales: todaySales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0,
    productsCount: productsCount || 0,
    lowStockCount: lowStockProducts?.length || 0,
    orders: ordersCount || 0
  };
}

// Get business dashboard stats (aggregated from all stores)
async function getBusinessDashboardStats(businessId: string) {
  // Get all stores for this business
  const { data: stores, error: storesError } = await supabase
    .from('store')
    .select('id')
    .eq('business_id', businessId)
    .eq('is_active', true);

  if (storesError) throw storesError;

  if (!stores || stores.length === 0) {
    return {
      sales: 0,
      productsCount: 0,
      lowStockCount: 0,
      orders: 0,
      storeCount: 0
    };
  }

  let totalSales = 0;
  let totalProductsCount = 0;
  let totalLowStockCount = 0;
  let totalOrders = 0;

  // Aggregate stats from all stores
  for (const store of stores) {
    try {
      const storeStats = await getStoreDashboardStats(store.id);
      if (storeStats) {
        totalSales += storeStats.sales || 0;
        totalProductsCount += storeStats.productsCount || 0;
        totalLowStockCount += storeStats.lowStockCount || 0;
        totalOrders += storeStats.orders || 0;
      }
    } catch (error) {
      console.error(`Error loading stats for store ${store.id}:`, error);
    }
  }

  return {
    sales: totalSales,
    productsCount: totalProductsCount,
    lowStockCount: totalLowStockCount,
    orders: totalOrders,
    storeCount: stores.length
  };
}
