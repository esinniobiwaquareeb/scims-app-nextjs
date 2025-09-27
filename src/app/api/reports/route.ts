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
      case 'customers':
        return await getBusinessCustomersReport(businessId, searchParams);
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

    let storeIds: string[] = [];

    if (storeId) {
      // Filter by specific store
      storeIds = [storeId];
    } else {
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

    return NextResponse.json({
      success: true,
      sales: sales || [],
      summary: {
        total_sales: totalSales,
        total_transactions: totalTransactions,
        average_order_value: averageOrderValue
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

async function getBusinessInventoryReport(businessId: string, searchParams?: URLSearchParams) {
  try {
    const storeId = searchParams?.get('store_id');
    let storeIds: string[] = [];

    if (storeId) {
      // Filter by specific store
      storeIds = [storeId];
    } else {
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

      storeIds = stores.map(store => store.id);
    }

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

    // Get sales data for performance calculations
    const { data: sales, error: salesError } = await supabase
      .from('sale')
      .select(`
        id,
        sale_item(
          quantity,
          unit_price,
          total_price,
          product_id
        )
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed');

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Calculate performance metrics for each product
    const productPerformance = products?.map(product => {
      // Find all sale items for this product
      const productSales = sales?.flatMap(sale => 
        sale.sale_item?.filter((item: { product_id: string; quantity: number; total_price: number }) => item.product_id === product.id) || []
      ) || [];

      // Calculate totals
      const soldQuantity = productSales.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const revenue = productSales.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const profit = productSales.reduce((sum, item) => {
        const itemCost = (item.quantity || 0) * (product.cost || 0);
        return sum + ((item.total_price || 0) - itemCost);
      }, 0);

      return {
        ...product,
        soldQuantity,
        revenue,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    }) || [];

    return NextResponse.json({
      success: true,
      products: productPerformance,
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

async function getBusinessCustomersReport(businessId: string, searchParams?: URLSearchParams) {
  try {
    const storeId = searchParams?.get('store_id');
    let storeIds: string[] = [];

    if (storeId) {
      // Filter by specific store
      storeIds = [storeId];
    } else {
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

      storeIds = stores.map(store => store.id);
    }

    // Get sales data to compute customer analytics
    const { data: sales, error: salesError } = await supabase
      .from('sale')
      .select(`
        id,
        total_amount,
        created_at,
        customer_id,
        customer:customer_id(
          id,
          name,
          email,
          phone
        )
      `)
      .in('store_id', storeIds)
      .eq('status', 'completed')
      .not('customer_id', 'is', null);

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Group sales by customer and compute metrics
    const customerMetrics = new Map();
    
    sales?.forEach((sale: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const customerId = sale.customer_id;
      const customer = Array.isArray(sale.customer) ? sale.customer[0] : sale.customer;
      
      if (!customerId || !customer) return;
      
      if (!customerMetrics.has(customerId)) {
        customerMetrics.set(customerId, {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          totalPurchases: 0,
          totalSpent: 0,
          lastVisit: null,
          firstVisit: null
        });
      }
      
      const metrics = customerMetrics.get(customerId);
      metrics.totalPurchases += 1;
      metrics.totalSpent += sale.total_amount || 0;
      
      const saleDate = new Date(sale.created_at);
      if (!metrics.lastVisit || saleDate > new Date(metrics.lastVisit)) {
        metrics.lastVisit = sale.created_at;
      }
      if (!metrics.firstVisit || saleDate < new Date(metrics.firstVisit)) {
        metrics.firstVisit = sale.created_at;
      }
    });

    // Convert to array and calculate average order value
    const customers = Array.from(customerMetrics.values()).map(customer => ({
      ...customer,
      avgOrderValue: customer.totalPurchases > 0 ? customer.totalSpent / customer.totalPurchases : 0,
      lastVisit: customer.lastVisit ? new Date(customer.lastVisit).toISOString() : null
    }));

    // Calculate summary statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.lastVisit).length;
    const newCustomersThisMonth = customers.filter(c => {
      if (!c.firstVisit) return false;
      const createdDate = new Date(c.firstVisit);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return createdDate >= monthAgo;
    }).length;

    return NextResponse.json({
      success: true,
      customers: customers,
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
