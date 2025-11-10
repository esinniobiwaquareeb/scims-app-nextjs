/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const type = searchParams.get('type');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'stores':
        return await getBusinessStoresReport(businessId);
      case 'sales':
        return await getBusinessSalesReport(businessId, searchParams);
      case 'inventory':
        return await getBusinessInventoryReport(businessId, searchParams);
      case 'products':
        return await getBusinessProductsReport(businessId, searchParams);
      case 'customers':
        return await getBusinessCustomersReport(businessId);
      case 'profit-loss':
        return await getProfitLossReport(businessId, searchParams);
      case 'cash-flow':
        return await getCashFlowReport(businessId, searchParams);
      case 'staff-performance':
        return await getStaffPerformanceReport(businessId, searchParams);
      case 'store-comparison':
        return await getStoreComparisonReport(businessId, searchParams);
      case 'period-comparison':
        return await getPeriodComparisonReport(businessId, searchParams);
      case 'peak-hours':
        return await getPeakHoursReport(businessId, searchParams);
      case 'discount-effectiveness':
        return await getDiscountEffectivenessReport(businessId, searchParams);
      case 'returns':
        return await getReturnsReport(businessId, searchParams);
      case 'customer-lifetime-value':
        return await getCustomerLifetimeValueReport(businessId, searchParams);
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in reports API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getBusinessStoresReport(businessId: string) {
  try {
    // Get all stores for the business
    const { data: stores, error: storesError } = await supabase
      .from('store')
      .select(`
        id,
        name,
        address,
        city,
        state,
        postal_code,
        phone,
        email,
        manager_name,
        is_active,
        created_at,
        updated_at
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      );
    }

    // Get sales data for each store
    const storesWithStats = await Promise.all(
      (stores || []).map(async (store) => {
        try {
          // Get today's sales for this store
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

          const { data: todaySales, error: salesError } = await supabase
            .from('sale')
            .select('total_amount')
            .eq('store_id', store.id)
            .eq('status', 'completed')
            .gte('transaction_date', startOfDay.toISOString())
            .lte('transaction_date', endOfDay.toISOString());

          if (salesError) {
            console.error(`Error fetching sales for store ${store.id}:`, salesError);
          }

          // Get product count for this store
          const { count: productCount, error: productError } = await supabase
            .from('product')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', store.id)
            .eq('is_active', true);

          if (productError) {
            console.error(`Error fetching product count for store ${store.id}:`, productError);
          }

          // Get low stock count for this store
          const { data: lowStockProducts, error: lowStockError } = await supabase
            .from('product')
            .select('*')
            .eq('store_id', store.id)
            .eq('is_active', true)
            .lte('stock_quantity', 10);

          if (lowStockError) {
            console.error(`Error fetching low stock for store ${store.id}:`, lowStockError);
          }

          return {
            ...store,
            today_sales: todaySales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0,
            product_count: productCount || 0,
            low_stock_count: lowStockProducts?.length || 0
          };
        } catch (error) {
          console.error(`Error processing store ${store.id}:`, error);
          return {
            ...store,
            today_sales: 0,
            product_count: 0,
            low_stock_count: 0
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      stores: storesWithStats
    });
  } catch (error) {
    console.error('Error in getBusinessStoresReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate stores report' },
      { status: 500 }
    );
  }
}

async function getBusinessSalesReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    let storeIds: string[];

    if (storeId) {
      // If store_id is provided, filter by that specific store
      storeIds = [storeId];
    } else {
      // Otherwise, get all stores for the business
      const { data: stores, error: storesError } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (storesError) {
        console.error('Error fetching stores:', storesError);
        return NextResponse.json(
          { error: 'Failed to fetch stores' },
          { status: 500 }
        );
      }

      if (!stores || stores.length === 0) {
        return NextResponse.json({
          success: true,
          sales: [],
          summary: {
            total_sales: 0,
            total_transactions: 0,
            average_order_value: 0
          },
          revenueData: [],
          categoryData: [],
          paymentData: []
        });
      }

      storeIds = stores.map(store => store.id);
    }

    // Build sales query
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
            cost,
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
      console.error('Error fetching sales:', salesError);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const totalSales = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
    const totalTransactions = sales?.length || 0;
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Calculate financial metrics from sales
    let totalProfit = 0;
    
    (sales || []).forEach((sale: any) => {
      (sale.sale_item || []).forEach((item: any) => {
        // Get product cost from product table
        const itemCost = parseFloat(item.product?.cost || 0);
        const itemRevenue = parseFloat(item.total_price || 0);
        const itemQuantity = item.quantity || 0;
        const itemProfit = itemRevenue - (itemCost * itemQuantity);
        totalProfit += itemProfit;
      });
    });

    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
    const operatingExpenses = 0; // This would need to come from a separate expenses table
    const netProfit = totalProfit - operatingExpenses;
    
    // Calculate return rate (would need supply return data)
    const returnRate = 0;
    
    // Calculate customer retention (would need customer purchase history)
    const uniqueCustomers = new Set((sales || []).map((s: any) => s.customer_id).filter(Boolean)).size;
    const customerRetention = uniqueCustomers > 0 ? (uniqueCustomers / uniqueCustomers) * 100 : 0;
    
    // Calculate inventory turnover (would need inventory data)
    const inventoryTurnover = 0;

    // Generate chart data
    // 1. Revenue & Profit Trend (grouped by date)
    const revenueDataMap: { [key: string]: { revenue: number; profit: number } } = {};
    (sales || []).forEach((sale: any) => {
      const saleDate = sale.transaction_date ? new Date(sale.transaction_date).toISOString().split('T')[0] : null;
      if (!saleDate) return;

      if (!revenueDataMap[saleDate]) {
        revenueDataMap[saleDate] = { revenue: 0, profit: 0 };
      }

      const saleRevenue = parseFloat(sale.total_amount || 0);
      revenueDataMap[saleDate].revenue += saleRevenue;

      // Calculate profit for this sale
      let saleProfit = 0;
      (sale.sale_item || []).forEach((item: any) => {
        const itemCost = parseFloat(item.product?.cost || 0);
        const itemRevenue = parseFloat(item.total_price || 0);
        const itemQuantity = item.quantity || 0;
        saleProfit += itemRevenue - (itemCost * itemQuantity);
      });
      revenueDataMap[saleDate].profit += saleProfit;
    });

    // Convert to array format for chart
    const revenueData = Object.entries(revenueDataMap)
      .map(([date, data]) => ({
        date,
        revenue: Number(data.revenue.toFixed(2)),
        profit: Number(data.profit.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Sales by Category (for pie chart)
    const categoryDataMap: { [key: string]: number } = {};
    (sales || []).forEach((sale: any) => {
      (sale.sale_item || []).forEach((item: any) => {
        const categoryName = item.product?.category?.name || 'Uncategorized';
        const itemRevenue = parseFloat(item.total_price || 0);
        categoryDataMap[categoryName] = (categoryDataMap[categoryName] || 0) + itemRevenue;
      });
    });

    // Convert to array format with colors for pie chart
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const categoryData = Object.entries(categoryDataMap)
      .map(([name, value], index) => ({
        name,
        value: Number(value.toFixed(2)),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    // 3. Payment Method Breakdown
    const paymentDataMap: { [key: string]: number } = {};
    (sales || []).forEach((sale: any) => {
      const paymentMethod = sale.payment_method || 'Unknown';
      paymentDataMap[paymentMethod] = (paymentDataMap[paymentMethod] || 0) + 1;
    });

    const totalPayments = Object.values(paymentDataMap).reduce((sum, count) => sum + count, 0);
    const paymentData = Object.entries(paymentDataMap)
      .map(([method, count]) => ({
        method,
        count,
        percentage: totalPayments > 0 ? Number(((count / totalPayments) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      sales: sales || [],
      summary: {
        total_sales: totalSales,
        total_transactions: totalTransactions,
        average_order_value: averageOrderValue,
        totalProfit,
        operatingExpenses,
        netProfit,
        profitMargin,
        returnRate,
        customerRetention,
        inventoryTurnover
      },
      revenueData,
      categoryData,
      paymentData
    });
  } catch (error) {
    console.error('Error in getBusinessSalesReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales report' },
      { status: 500 }
    );
  }
}

async function getBusinessInventoryReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const storeId = searchParams.get('store_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let storeIds: string[];

    if (storeId) {
      // If store_id is provided, filter by that specific store
      storeIds = [storeId];
    } else {
      // Otherwise, get all stores for the business
      const { data: stores, error: storesError } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (storesError) {
        console.error('Error fetching stores:', storesError);
        return NextResponse.json(
          { error: 'Failed to fetch stores' },
          { status: 500 }
        );
      }

      if (!stores || stores.length === 0) {
        return NextResponse.json({
          success: true,
          products: [],
          summary: {
            totalProducts: 0,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            totalInventoryValue: 0
          }
        });
      }

      storeIds = stores.map(store => store.id);
    }

    // Get all products for the specified stores
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select(`
        id,
        name,
        sku,
        stock_quantity,
        reorder_level,
        cost,
        price,
        category:category_id(name),
        brand:brand_id(name),
        supplier:supplier_id(name),
        store_id,
        created_at
      `)
      .in('store_id', storeIds)
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Calculate inventory statistics
    const totalProducts = products?.length || 0;
    const inStock = products?.filter(p => (p.stock_quantity || 0) > (p.reorder_level || 0)).length || 0;
    const lowStock = products?.filter(p => (p.stock_quantity || 0) <= (p.reorder_level || 0) && (p.stock_quantity || 0) > 0).length || 0;
    const outOfStock = products?.filter(p => (p.stock_quantity || 0) <= 0).length || 0;

    // Calculate total inventory value
    const totalValue = products?.reduce((sum, product) => {
      const stockValue = (product.stock_quantity || 0) * (product.cost || 0);
      return sum + stockValue;
    }, 0) || 0;

    // Get stock movements if date range is provided
    const productsWithStockMovements = await Promise.all(
      (products || []).map(async (product: any) => {
        let initialStock = product.stock_quantity || 0;
        let quantitySold = 0;
        let quantityRestocked = 0;
        const currentStock = product.stock_quantity || 0;

        if (startDate && endDate) {
          // Get initial stock (stock at start of date range)
          // Initial stock = current stock + sold - restocked (for the period)
          
          // Get quantity sold in the date range
          const { data: salesItems, error: salesError } = await supabase
            .from('sale_item')
            .select('quantity, sale!inner(transaction_date, status)')
            .eq('product_id', product.id)
            .eq('sale.status', 'completed')
            .gte('sale.transaction_date', startDate)
            .lte('sale.transaction_date', endDate);

          if (!salesError && salesItems) {
            quantitySold = salesItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
          }

          // Get quantity restocked in the date range
          const { data: restockItems, error: restockError } = await supabase
            .from('restock_item')
            .select('received_quantity, restock_order!inner(created_at, status)')
            .eq('product_id', product.id)
            .eq('restock_order.status', 'received')
            .gte('restock_order.created_at', startDate)
            .lte('restock_order.created_at', endDate);

          if (!restockError && restockItems) {
            quantityRestocked = restockItems.reduce((sum, item) => sum + (item.received_quantity || 0), 0);
          }

          // Calculate initial stock: current stock + sold - restocked
          // This gives us the stock at the start of the period
          initialStock = currentStock + quantitySold - quantityRestocked;
          // Ensure initial stock is not negative
          initialStock = Math.max(0, initialStock);
        }

        return {
          ...product,
          initialStock,
          quantitySold,
          quantityRestocked,
          currentStock
        };
      })
    );

    return NextResponse.json({
      success: true,
      products: productsWithStockMovements || [],
      summary: {
        totalProducts: totalProducts,
        inStock: inStock,
        lowStock: lowStock,
        outOfStock: outOfStock,
        totalInventoryValue: totalValue
      }
    });
  } catch (error) {
    console.error('Error in getBusinessInventoryReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate inventory report' },
      { status: 500 }
    );
  }
}

async function getBusinessCustomersReport(businessId: string) {
  try {
    // First get all stores for the business
    const { data: stores, error: storesError } = await supabase
      .from('store')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      );
    }

    if (!stores || stores.length === 0) {
      return NextResponse.json({
        success: true,
        customers: [],
        summary: {
          total_customers: 0,
          active_customers: 0,
          new_customers_this_month: 0
        }
      });
    }

    const storeIds = stores.map(store => store.id);

    // Get all customers for all stores in the business
    const { data: customers, error: customersError } = await supabase
      .from('customer')
      .select(`
        id,
        name,
        email,
        phone,
        total_purchases,
        last_purchase_at,
        created_at,
        store_id
      `)
      .in('store_id', storeIds)
      .eq('is_active', true);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    // Get sales data for customers to calculate actual spending
    const { data: sales, error: salesError } = await supabase
      .from('sale')
      .select('customer_id, total_amount, transaction_date')
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .not('customer_id', 'is', null);

    if (salesError) {
      console.error('Error fetching sales for customers:', salesError);
    }

    // Calculate customer statistics from sales
    const customerStats: { [key: string]: { totalSpent: number; orderCount: number; lastVisit: Date | null } } = {};
    (sales || []).forEach((sale: any) => {
      const customerId = sale.customer_id;
      if (!customerStats[customerId]) {
        customerStats[customerId] = { totalSpent: 0, orderCount: 0, lastVisit: null };
      }
      customerStats[customerId].totalSpent += parseFloat(sale.total_amount || 0);
      customerStats[customerId].orderCount += 1;
      const saleDate = new Date(sale.transaction_date);
      if (!customerStats[customerId].lastVisit || saleDate > customerStats[customerId].lastVisit!) {
        customerStats[customerId].lastVisit = saleDate;
      }
    });

    // Merge customer data with sales stats
    const customersWithStats = (customers || []).map((customer: any) => {
      const stats = customerStats[customer.id] || { totalSpent: 0, orderCount: 0, lastVisit: null };
      const avgOrderValue = stats.orderCount > 0 ? stats.totalSpent / stats.orderCount : 0;
      
      return {
        ...customer,
        total_purchases: stats.orderCount, // Actual purchase count from sales
        total_spent: stats.totalSpent, // Actual total spent
        average_order_value: avgOrderValue,
        last_purchase_at: stats.lastVisit || customer.last_purchase_at
      };
    });

    // Calculate customer statistics
    const totalCustomers = customersWithStats.length;
    const activeCustomers = customersWithStats.filter(c => c.last_purchase_at).length;
    const newCustomersThisMonth = customersWithStats.filter(c => {
      const createdDate = new Date(c.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return createdDate >= monthAgo;
    }).length;

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
      summary: {
        total_customers: totalCustomers,
        active_customers: activeCustomers,
        new_customers_this_month: newCustomersThisMonth
      }
    });
  } catch (error) {
    console.error('Error in getBusinessCustomersReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate customers report' },
      { status: 500 }
    );
  }
}

async function getBusinessProductsReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    // Get all stores for the business
    const { data: stores, error: storesError } = await supabase
      .from('store')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      );
    }

    if (!stores || stores.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
        summary: {
          total_products: 0,
          total_sold: 0,
          total_revenue: 0
        }
      });
    }

    const storeIds = storeId ? [storeId] : stores.map(store => store.id);

    // Get products
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select(`
        id,
        name,
        sku,
        price,
        cost,
        stock_quantity,
        category:category_id(name),
        store_id
      `)
      .in('store_id', storeIds)
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Get sales data for these products
    let salesQuery = supabase
      .from('sale_item')
      .select(`
        product_id,
        quantity,
        total_price,
        sale!inner(
          id,
          transaction_date,
          status,
          store_id
        )
      `)
      .eq('sale.status', 'completed')
      .in('sale.store_id', storeIds);

    if (startDate) {
      salesQuery = salesQuery.gte('sale.transaction_date', startDate);
    }
    if (endDate) {
      salesQuery = salesQuery.lte('sale.transaction_date', endDate);
    }

    const { data: salesItems, error: salesError } = await salesQuery;

    if (salesError) {
      console.error('Error fetching sales items:', salesError);
    }

    // Calculate product performance
    const productStats: { [key: string]: { quantity: number; revenue: number } } = {};
    (salesItems || []).forEach((item: any) => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = { quantity: 0, revenue: 0 };
      }
      productStats[productId].quantity += item.quantity || 0;
      productStats[productId].revenue += parseFloat(item.total_price || 0);
    });

    // Merge product data with sales stats
    const productsWithStats = (products || []).map((product: any) => {
      const stats = productStats[product.id] || { quantity: 0, revenue: 0 };
      const cost = parseFloat(product.cost || 0);
      const profit = stats.revenue - (stats.quantity * cost);
      
      return {
        id: product.id,
        name: product.name || 'Unknown Product',
        sku: product.sku || 'N/A',
        category: product.category?.name || 'Uncategorized',
        soldQuantity: stats.quantity,
        totalQuantity: product.stock_quantity || 0,
        revenue: stats.revenue,
        profit: profit
      };
    }).filter((p: any) => p.soldQuantity > 0); // Only show products that have been sold

    return NextResponse.json({
      success: true,
      products: productsWithStats,
      summary: {
        total_products: productsWithStats.length,
        total_sold: productsWithStats.reduce((sum: number, p: any) => sum + p.soldQuantity, 0),
        total_revenue: productsWithStats.reduce((sum: number, p: any) => sum + p.revenue, 0)
      }
    });
  } catch (error) {
    console.error('Error in getBusinessProductsReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate products report' },
      { status: 500 }
    );
  }
}

// Profit & Loss Statement
async function getProfitLossReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    if (!storeIds.length) {
      return NextResponse.json({
        success: true,
        revenue: { total: 0, breakdown: [] },
        cogs: { total: 0, breakdown: [] },
        grossProfit: 0,
        operatingExpenses: 0,
        netProfit: 0,
        profitMargin: 0
      });
    }

    // Get sales data
    let salesQuery = supabase
      .from('sale')
      .select(`
        total_amount,
        discount_amount,
        sale_item(
          quantity,
          unit_price,
          total_price,
          product(cost)
        )
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed');

    if (startDate) salesQuery = salesQuery.gte('transaction_date', startDate);
    if (endDate) salesQuery = salesQuery.lte('transaction_date', endDate);

    const { data: sales } = await salesQuery;

    // Calculate Revenue
    const totalRevenue = sales?.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0) || 0;
    const totalDiscounts = sales?.reduce((sum, s) => sum + parseFloat(s.discount_amount || 0), 0) || 0;
    const grossRevenue = totalRevenue + totalDiscounts;

    // Calculate COGS (Cost of Goods Sold)
    let totalCOGS = 0;
    const cogsBreakdown: { [key: string]: number } = {};
    sales?.forEach((sale: any) => {
      sale.sale_item?.forEach((item: any) => {
        const cost = parseFloat(item.product?.cost || 0);
        const quantity = item.quantity || 0;
        const itemCOGS = cost * quantity;
        totalCOGS += itemCOGS;
        const category = item.product?.category?.name || 'Uncategorized';
        cogsBreakdown[category] = (cogsBreakdown[category] || 0) + itemCOGS;
      });
    });

    const grossProfit = grossRevenue - totalCOGS;
    const operatingExpenses = 0; // Would need expenses table
    const netProfit = grossProfit - operatingExpenses;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Revenue breakdown by category
    const revenueBreakdown: { [key: string]: number } = {};
    sales?.forEach((sale: any) => {
      sale.sale_item?.forEach((item: any) => {
        const category = item.product?.category?.name || 'Uncategorized';
        const revenue = parseFloat(item.total_price || 0);
        revenueBreakdown[category] = (revenueBreakdown[category] || 0) + revenue;
      });
    });

    return NextResponse.json({
      success: true,
      revenue: {
        total: grossRevenue,
        discounts: totalDiscounts,
        net: totalRevenue,
        breakdown: Object.entries(revenueBreakdown).map(([name, value]) => ({ name, value }))
      },
      cogs: {
        total: totalCOGS,
        breakdown: Object.entries(cogsBreakdown).map(([name, value]) => ({ name, value }))
      },
      grossProfit,
      operatingExpenses,
      netProfit,
      profitMargin: Number(profitMargin.toFixed(2))
    });
  } catch (error) {
    console.error('Error in getProfitLossReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate profit & loss report' },
      { status: 500 }
    );
  }
}

// Cash Flow Report
async function getCashFlowReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    // Cash Inflows (Sales)
    let salesQuery = supabase
      .from('sale')
      .select('total_amount, payment_method, transaction_date')
      .in('store_id', storeIds)
      .eq('status', 'completed');

    if (startDate) salesQuery = salesQuery.gte('transaction_date', startDate);
    if (endDate) salesQuery = salesQuery.lte('transaction_date', endDate);

    const { data: sales } = await salesQuery;
    const totalCashIn = sales?.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0) || 0;

    // Cash Outflows (Restock orders)
    let restockQuery = supabase
      .from('restock_order')
      .select('total_amount, status, created_at')
      .in('store_id', storeIds)
      .eq('status', 'received');

    if (startDate) restockQuery = restockQuery.gte('created_at', startDate);
    if (endDate) restockQuery = restockQuery.lte('created_at', endDate);

    const { data: restocks } = await restockQuery;
    const totalCashOut = restocks?.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0) || 0;

    // Payment method breakdown
    const paymentBreakdown: { [key: string]: number } = {};
    sales?.forEach((sale: any) => {
      const method = sale.payment_method || 'Unknown';
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + parseFloat(sale.total_amount || 0);
    });

    // Daily cash flow
    const dailyFlow: { [key: string]: { in: number; out: number } } = {};
    sales?.forEach((sale: any) => {
      const date = sale.transaction_date ? new Date(sale.transaction_date).toISOString().split('T')[0] : null;
      if (date) {
        if (!dailyFlow[date]) dailyFlow[date] = { in: 0, out: 0 };
        dailyFlow[date].in += parseFloat(sale.total_amount || 0);
      }
    });
    restocks?.forEach((restock: any) => {
      const date = restock.created_at ? new Date(restock.created_at).toISOString().split('T')[0] : null;
      if (date) {
        if (!dailyFlow[date]) dailyFlow[date] = { in: 0, out: 0 };
        dailyFlow[date].out += parseFloat(restock.total_amount || 0);
      }
    });

    const netCashFlow = totalCashIn - totalCashOut;

    return NextResponse.json({
      success: true,
      cashIn: {
        total: totalCashIn,
        breakdown: Object.entries(paymentBreakdown).map(([method, amount]) => ({ method, amount }))
      },
      cashOut: {
        total: totalCashOut,
        breakdown: [{ category: 'Restock Orders', amount: totalCashOut }]
      },
      netCashFlow,
      dailyFlow: Object.entries(dailyFlow)
        .map(([date, flow]) => ({ date, ...flow, net: flow.in - flow.out }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    });
  } catch (error) {
    console.error('Error in getCashFlowReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate cash flow report' },
      { status: 500 }
    );
  }
}

// Staff Performance Report
async function getStaffPerformanceReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    // Get staff sales
    let salesQuery = supabase
      .from('sale')
      .select(`
        cashier_id,
        total_amount,
        transaction_date,
        sale_item(quantity, total_price, product(cost)),
        user:user(
          id,
          name,
          username
        )
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .not('cashier_id', 'is', null);

    if (startDate) salesQuery = salesQuery.gte('transaction_date', startDate);
    if (endDate) salesQuery = salesQuery.lte('transaction_date', endDate);

    const { data: sales } = await salesQuery;

    // Calculate staff performance
    const staffStats: { [key: string]: {
      name: string;
      username: string;
      transactions: number;
      revenue: number;
      profit: number;
      avgTransactionValue: number;
      itemsSold: number;
    } } = {};

    sales?.forEach((sale: any) => {
      const staffId = sale.cashier_id;
      if (!staffId) return;

      if (!staffStats[staffId]) {
        staffStats[staffId] = {
          name: sale.user?.name || sale.user?.username || 'Unknown',
          username: sale.user?.username || '',
          transactions: 0,
          revenue: 0,
          profit: 0,
          avgTransactionValue: 0,
          itemsSold: 0
        };
      }

      staffStats[staffId].transactions += 1;
      staffStats[staffId].revenue += parseFloat(sale.total_amount || 0);
      
      let saleProfit = 0;
      sale.sale_item?.forEach((item: any) => {
        const cost = parseFloat(item.product?.cost || 0);
        const revenue = parseFloat(item.total_price || 0);
        staffStats[staffId].itemsSold += item.quantity || 0;
        saleProfit += revenue - (cost * (item.quantity || 0));
      });
      staffStats[staffId].profit += saleProfit;
    });

    // Calculate averages
    Object.keys(staffStats).forEach(staffId => {
      const stats = staffStats[staffId];
      stats.avgTransactionValue = stats.transactions > 0 ? stats.revenue / stats.transactions : 0;
    });

    const staffList = Object.values(staffStats).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      staff: staffList,
      summary: {
        totalStaff: staffList.length,
        totalTransactions: staffList.reduce((sum, s) => sum + s.transactions, 0),
        totalRevenue: staffList.reduce((sum, s) => sum + s.revenue, 0),
        avgTransactionsPerStaff: staffList.length > 0 ? staffList.reduce((sum, s) => sum + s.transactions, 0) / staffList.length : 0
      }
    });
  } catch (error) {
    console.error('Error in getStaffPerformanceReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate staff performance report' },
      { status: 500 }
    );
  }
}

// Store Comparison Report
async function getStoreComparisonReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const { data: stores } = await supabase
      .from('store')
      .select('id, name')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (!stores || stores.length === 0) {
      return NextResponse.json({
        success: true,
        stores: []
      });
    }

    const storeIds = stores.map(s => s.id);

    // Get sales for each store
    let salesQuery = supabase
      .from('sale')
      .select(`
        store_id,
        total_amount,
        transaction_date,
        sale_item(quantity, total_price, product(cost))
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed');

    if (startDate) salesQuery = salesQuery.gte('transaction_date', startDate);
    if (endDate) salesQuery = salesQuery.lte('transaction_date', endDate);

    const { data: sales } = await salesQuery;

    // Calculate store metrics
    const storeMetrics = stores.map(store => {
      const storeSales = sales?.filter((s: any) => s.store_id === store.id) || [];
      const revenue = storeSales.reduce((sum: number, s: any) => sum + parseFloat(s.total_amount || 0), 0);
      const transactions = storeSales.length;
      const avgTransactionValue = transactions > 0 ? revenue / transactions : 0;

      let profit = 0;
      let itemsSold = 0;
      storeSales.forEach((sale: any) => {
        sale.sale_item?.forEach((item: any) => {
          const cost = parseFloat(item.product?.cost || 0);
          const revenue = parseFloat(item.total_price || 0);
          itemsSold += item.quantity || 0;
          profit += revenue - (cost * (item.quantity || 0));
        });
      });

      return {
        storeId: store.id,
        storeName: store.name,
        revenue,
        transactions,
        avgTransactionValue,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
        itemsSold
      };
    });

    return NextResponse.json({
      success: true,
      stores: storeMetrics.sort((a, b) => b.revenue - a.revenue)
    });
  } catch (error) {
    console.error('Error in getStoreComparisonReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate store comparison report' },
      { status: 500 }
    );
  }
}

// Period Comparison Report (YoY, MoM, etc.)
async function getPeriodComparisonReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const compareType = searchParams.get('compare_type') || 'previous'; // previous, yoy, mom
    const storeId = searchParams.get('store_id');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    const periodDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));

    let previousStart: Date;
    let previousEnd: Date;

    if (compareType === 'yoy') {
      previousStart = new Date(currentStart);
      previousStart.setFullYear(previousStart.getFullYear() - 1);
      previousEnd = new Date(currentEnd);
      previousEnd.setFullYear(previousEnd.getFullYear() - 1);
    } else if (compareType === 'mom') {
      previousStart = new Date(currentStart);
      previousStart.setMonth(previousStart.getMonth() - 1);
      previousEnd = new Date(currentEnd);
      previousEnd.setMonth(previousEnd.getMonth() - 1);
    } else {
      // Previous period (same length)
      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - periodDays);
    }

    // Get current period sales
    const currentSalesQuery = supabase
      .from('sale')
      .select('total_amount, sale_item(quantity, total_price, product(cost))')
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .gte('transaction_date', currentStart.toISOString())
      .lte('transaction_date', currentEnd.toISOString());

    const { data: currentSales } = await currentSalesQuery;

    // Get previous period sales
    const previousSalesQuery = supabase
      .from('sale')
      .select('total_amount, sale_item(quantity, total_price, product(cost))')
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .gte('transaction_date', previousStart.toISOString())
      .lte('transaction_date', previousEnd.toISOString());

    const { data: previousSales } = await previousSalesQuery;

    // Calculate metrics
    const calculateMetrics = (sales: any[]) => {
      const revenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
      const transactions = sales.length;
      let profit = 0;
      sales.forEach((sale: any) => {
        sale.sale_item?.forEach((item: any) => {
          const cost = parseFloat(item.product?.cost || 0);
          const revenue = parseFloat(item.total_price || 0);
          profit += revenue - (cost * (item.quantity || 0));
        });
      });
      return { revenue, transactions, profit, avgTransactionValue: transactions > 0 ? revenue / transactions : 0 };
    };

    const current = calculateMetrics(currentSales || []);
    const previous = calculateMetrics(previousSales || []);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return NextResponse.json({
      success: true,
      currentPeriod: {
        start: currentStart.toISOString(),
        end: currentEnd.toISOString(),
        ...current
      },
      previousPeriod: {
        start: previousStart.toISOString(),
        end: previousEnd.toISOString(),
        ...previous
      },
      comparison: {
        revenue: {
          current: current.revenue,
          previous: previous.revenue,
          change: calculateChange(current.revenue, previous.revenue),
          changeAmount: current.revenue - previous.revenue
        },
        transactions: {
          current: current.transactions,
          previous: previous.transactions,
          change: calculateChange(current.transactions, previous.transactions),
          changeAmount: current.transactions - previous.transactions
        },
        profit: {
          current: current.profit,
          previous: previous.profit,
          change: calculateChange(current.profit, previous.profit),
          changeAmount: current.profit - previous.profit
        },
        avgTransactionValue: {
          current: current.avgTransactionValue,
          previous: previous.avgTransactionValue,
          change: calculateChange(current.avgTransactionValue, previous.avgTransactionValue),
          changeAmount: current.avgTransactionValue - previous.avgTransactionValue
        }
      }
    });
  } catch (error) {
    console.error('Error in getPeriodComparisonReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate period comparison report' },
      { status: 500 }
    );
  }
}

// Peak Hours Report
async function getPeakHoursReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    let salesQuery = supabase
      .from('sale')
      .select('total_amount, transaction_date, created_at')
      .in('store_id', storeIds)
      .eq('status', 'completed');

    if (startDate) salesQuery = salesQuery.gte('transaction_date', startDate);
    if (endDate) salesQuery = salesQuery.lte('transaction_date', endDate);

    const { data: sales } = await salesQuery;

    // Group by hour
    const hourlyData: { [key: number]: { transactions: number; revenue: number } } = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { transactions: 0, revenue: 0 };
    }

    sales?.forEach((sale: any) => {
      const date = new Date(sale.transaction_date || sale.created_at);
      const hour = date.getHours();
      hourlyData[hour].transactions += 1;
      hourlyData[hour].revenue += parseFloat(sale.total_amount || 0);
    });

    // Group by day of week
    const dayOfWeekData: { [key: number]: { transactions: number; revenue: number; day: string } } = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      dayOfWeekData[i] = { transactions: 0, revenue: 0, day: dayNames[i] };
    }

    sales?.forEach((sale: any) => {
      const date = new Date(sale.transaction_date || sale.created_at);
      const day = date.getDay();
      dayOfWeekData[day].transactions += 1;
      dayOfWeekData[day].revenue += parseFloat(sale.total_amount || 0);
    });

    return NextResponse.json({
      success: true,
      hourly: Object.entries(hourlyData).map(([hour, data]) => ({
        hour: parseInt(hour),
        hourLabel: `${hour}:00`,
        ...data
      })),
      dayOfWeek: Object.values(dayOfWeekData)
    });
  } catch (error) {
    console.error('Error in getPeakHoursReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate peak hours report' },
      { status: 500 }
    );
  }
}

// Discount Effectiveness Report
async function getDiscountEffectivenessReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    let salesQuery = supabase
      .from('sale')
      .select(`
        total_amount,
        discount_amount,
        applied_coupon_id,
        applied_promotion_id,
        applied_coupon(name, code, discount_value, discount_type(name)),
        applied_promotion(name, discount_value, discount_type(name)),
        transaction_date
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed');

    if (startDate) salesQuery = salesQuery.gte('transaction_date', startDate);
    if (endDate) salesQuery = salesQuery.lte('transaction_date', endDate);

    const { data: sales } = await salesQuery;

    const totalSales = sales?.length || 0;
    const salesWithDiscount = sales?.filter(s => s.discount_amount && parseFloat(s.discount_amount || 0) > 0).length || 0;
    const totalDiscountAmount = sales?.reduce((sum, s) => sum + parseFloat(s.discount_amount || 0), 0) || 0;
    const totalRevenue = sales?.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0) || 0;
    const totalRevenueWithDiscount = sales?.filter(s => s.discount_amount && parseFloat(s.discount_amount || 0) > 0)
      .reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0) || 0;

    // Coupon analysis
    const couponStats: { [key: string]: { name: string; uses: number; totalDiscount: number; totalRevenue: number } } = {};
    sales?.forEach((sale: any) => {
      if (sale.applied_coupon_id && sale.applied_coupon) {
        const couponId = sale.applied_coupon_id;
        if (!couponStats[couponId]) {
          couponStats[couponId] = {
            name: sale.applied_coupon.name || sale.applied_coupon.code || 'Unknown',
            uses: 0,
            totalDiscount: 0,
            totalRevenue: 0
          };
        }
        couponStats[couponId].uses += 1;
        couponStats[couponId].totalDiscount += parseFloat(sale.discount_amount || 0);
        couponStats[couponId].totalRevenue += parseFloat(sale.total_amount || 0);
      }
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalSales,
        salesWithDiscount,
        discountRate: totalSales > 0 ? (salesWithDiscount / totalSales) * 100 : 0,
        totalDiscountAmount,
        totalRevenue,
        avgDiscountPerSale: salesWithDiscount > 0 ? totalDiscountAmount / salesWithDiscount : 0,
        avgRevenueWithDiscount: salesWithDiscount > 0 ? totalRevenueWithDiscount / salesWithDiscount : 0,
        avgRevenueWithoutDiscount: (totalSales - salesWithDiscount) > 0 
          ? (totalRevenue - totalRevenueWithDiscount) / (totalSales - salesWithDiscount) 
          : 0
      },
      coupons: Object.values(couponStats).sort((a, b) => b.uses - a.uses)
    });
  } catch (error) {
    console.error('Error in getDiscountEffectivenessReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate discount effectiveness report' },
      { status: 500 }
    );
  }
}

// Returns Report
async function getReturnsReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const storeId = searchParams.get('store_id');

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    // Get exchange transactions (returns)
    let exchangesQuery = supabase
      .from('exchange_transaction')
      .select(`
        id,
        transaction_type,
        refund_amount,
        created_at,
        exchange_item(
          quantity,
          product(name, sku, category:category_id(name))
        )
      `)
      .in('store_id', storeIds)
      .eq('transaction_type', 'return')
      .eq('status', 'completed');

    if (startDate) exchangesQuery = exchangesQuery.gte('created_at', startDate);
    if (endDate) exchangesQuery = exchangesQuery.lte('created_at', endDate);

    const { data: exchanges } = await exchangesQuery;

    const totalReturns = exchanges?.length || 0;
    const totalRefundAmount = exchanges?.reduce((sum, e) => sum + parseFloat(e.refund_amount || 0), 0) || 0;

    // Product breakdown
    const productReturns: { [key: string]: { name: string; sku: string; category: string; quantity: number; refundAmount: number } } = {};
    exchanges?.forEach((exchange: any) => {
      exchange.exchange_item?.forEach((item: any) => {
        const productId = item.product?.id || 'unknown';
        if (!productReturns[productId]) {
          productReturns[productId] = {
            name: item.product?.name || 'Unknown',
            sku: item.product?.sku || 'N/A',
            category: item.product?.category?.name || 'Uncategorized',
            quantity: 0,
            refundAmount: 0
          };
        }
        productReturns[productId].quantity += item.quantity || 0;
        productReturns[productId].refundAmount += parseFloat(exchange.refund_amount || 0) / (exchange.exchange_item?.length || 1);
      });
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalReturns,
        totalRefundAmount,
        avgRefundAmount: totalReturns > 0 ? totalRefundAmount / totalReturns : 0
      },
      products: Object.values(productReturns).sort((a, b) => b.quantity - a.quantity)
    });
  } catch (error) {
    console.error('Error in getReturnsReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate returns report' },
      { status: 500 }
    );
  }
}

// Customer Lifetime Value Report
async function getCustomerLifetimeValueReport(businessId: string, searchParams: URLSearchParams) {
  try {
    const storeId = searchParams.get('store_id');

    let storeIds: string[];
    if (storeId) {
      storeIds = [storeId];
    } else {
      const { data: stores } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);
      storeIds = stores?.map(s => s.id) || [];
    }

    // Get all customer sales
    const { data: sales } = await supabase
      .from('sale')
      .select(`
        customer_id,
        total_amount,
        transaction_date,
        customer(id, name, email, phone, created_at)
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .not('customer_id', 'is', null);

    // Calculate CLV for each customer
    const customerCLV: { [key: string]: {
      customerId: string;
      name: string;
      email: string;
      phone: string;
      firstPurchase: string;
      lastPurchase: string;
      totalRevenue: number;
      totalTransactions: number;
      avgOrderValue: number;
      daysSinceFirstPurchase: number;
      daysSinceLastPurchase: number;
      clv: number;
    } } = {};

    sales?.forEach((sale: any) => {
      const customerId = sale.customer_id;
      if (!customerId) return;

      if (!customerCLV[customerId]) {
        customerCLV[customerId] = {
          customerId,
          name: sale.customer?.name || 'Unknown',
          email: sale.customer?.email || '',
          phone: sale.customer?.phone || '',
          firstPurchase: sale.transaction_date,
          lastPurchase: sale.transaction_date,
          totalRevenue: 0,
          totalTransactions: 0,
          avgOrderValue: 0,
          daysSinceFirstPurchase: 0,
          daysSinceLastPurchase: 0,
          clv: 0
        };
      }

      customerCLV[customerId].totalRevenue += parseFloat(sale.total_amount || 0);
      customerCLV[customerId].totalTransactions += 1;

      const saleDate = new Date(sale.transaction_date);
      const firstDate = new Date(customerCLV[customerId].firstPurchase);
      const lastDate = new Date(customerCLV[customerId].lastPurchase);

      if (saleDate < firstDate) {
        customerCLV[customerId].firstPurchase = sale.transaction_date;
      }
      if (saleDate > lastDate) {
        customerCLV[customerId].lastPurchase = sale.transaction_date;
      }
    });

    // Calculate CLV metrics
    const now = new Date();
    Object.values(customerCLV).forEach(customer => {
      customer.avgOrderValue = customer.totalTransactions > 0 ? customer.totalRevenue / customer.totalTransactions : 0;
      customer.daysSinceFirstPurchase = Math.floor((now.getTime() - new Date(customer.firstPurchase).getTime()) / (1000 * 60 * 60 * 24));
      customer.daysSinceLastPurchase = Math.floor((now.getTime() - new Date(customer.lastPurchase).getTime()) / (1000 * 60 * 60 * 24));
      
      // Simple CLV calculation: (Avg Order Value × Purchase Frequency × Customer Lifespan)
      const purchaseFrequency = customer.daysSinceFirstPurchase > 0 
        ? (customer.totalTransactions / customer.daysSinceFirstPurchase) * 365 
        : 0;
      const customerLifespan = customer.daysSinceFirstPurchase / 365; // in years
      customer.clv = customer.avgOrderValue * purchaseFrequency * customerLifespan;
    });

    const customers = Object.values(customerCLV).sort((a, b) => b.clv - a.clv);

    return NextResponse.json({
      success: true,
      customers,
      summary: {
        totalCustomers: customers.length,
        avgCLV: customers.length > 0 ? customers.reduce((sum, c) => sum + c.clv, 0) / customers.length : 0,
        totalCLV: customers.reduce((sum, c) => sum + c.clv, 0),
        topCustomers: customers.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error in getCustomerLifetimeValueReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate customer lifetime value report' },
      { status: 500 }
    );
  }
}
