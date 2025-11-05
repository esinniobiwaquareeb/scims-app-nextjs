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
        return await getBusinessInventoryReport(businessId);
      case 'products':
        return await getBusinessProductsReport(businessId, searchParams);
      case 'customers':
        return await getBusinessCustomersReport(businessId);
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
        sales: [],
        summary: {
          total_sales: 0,
          total_transactions: 0,
          average_order_value: 0
        }
      });
    }

    const storeIds = stores.map(store => store.id);

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
      }
    });
  } catch (error) {
    console.error('Error in getBusinessSalesReport:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales report' },
      { status: 500 }
    );
  }
}

async function getBusinessInventoryReport(businessId: string) {
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
        products: [],
        summary: {
          total_products: 0,
          in_stock: 0,
          low_stock: 0,
          out_of_stock: 0,
          total_inventory_value: 0
        }
      });
    }

    const storeIds = stores.map(store => store.id);

    // Get all products for all stores in the business
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

    return NextResponse.json({
      success: true,
      products: products || [],
      summary: {
        total_products: totalProducts,
        in_stock: inStock,
        low_stock: lowStock,
        out_of_stock: outOfStock,
        total_inventory_value: totalValue
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
