import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'store_id is required' },
        { status: 400 }
      );
    }

    // Get today's date in local timezone
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Fetch today's sales
    const { data: todaySales, error: salesError } = await supabase
      .from('sale')
      .select('total_amount, status')
      .eq('store_id', storeId)
      .gte('transaction_date', startOfDay.toISOString())
      .lte('transaction_date', endOfDay.toISOString())
      .eq('status', 'completed');

    if (salesError) {
      console.error('Sales query error:', salesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Fetch total products
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select('id, stock_quantity, min_stock_level')
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (productsError) {
      console.error('Products query error:', productsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products data' },
        { status: 500 }
      );
    }

    // Fetch store staff
    const { data: staff, error: staffError } = await supabase
      .from('user')
      .select('id, name, role')
      .eq('is_active', true);

    if (staffError) {
      console.error('Staff query error:', staffError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch staff data' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const todaySalesTotal = todaySales?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0) || 0;
    const totalProducts = products?.length || 0;
    const lowStockItems = products?.filter(p => (p.stock_quantity || 0) <= (p.min_stock_level || 0)).length || 0;
    const totalStaff = staff?.filter(s => s.role !== 'superadmin').length || 0;

    // Fetch recent sales for activity feed
    const { data: recentSales, error: recentSalesError } = await supabase
      .from('sale')
      .select(`
        id,
        receipt_number,
        total_amount,
        transaction_date,
        customer:customer_id(name),
        cashier:user(name)
      `)
      .eq('store_id', storeId)
      .eq('status', 'completed')
      .order('transaction_date', { ascending: false })
      .limit(10);

    if (recentSalesError) {
      console.error('Recent sales query error:', recentSalesError);
      // Continue without recent sales data
    }

    // Fetch low stock products - we'll filter in JavaScript since Supabase doesn't support column comparison
    const { data: allProducts, error: lowStockError } = await supabase
      .from('product')
      .select('id, name, stock_quantity, min_stock_level')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true })
      .limit(10);

    // Filter low stock products in JavaScript
    const lowStockProducts = allProducts?.filter(p => 
      (p.stock_quantity || 0) <= (p.min_stock_level || 0)
    ).slice(0, 5) || [];

    if (lowStockError) {
      console.error('Low stock products query error:', lowStockError);
      // Continue without low stock data
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          todaySales: todaySalesTotal,
          totalProducts,
          lowStockItems,
          totalStaff
        },
        recentSales: recentSales || [],
        lowStockProducts: lowStockProducts || []
      }
    });

  } catch (error) {
    console.error('Store admin dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
