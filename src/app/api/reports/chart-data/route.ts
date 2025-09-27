import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const chartType = searchParams.get('chart_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // If no storeId provided, we'll get all stores for the business
    // This allows charts to work when "All Stores" is selected
    const businessId = searchParams.get('business_id');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    if (!chartType) {
      return NextResponse.json(
        { error: 'Chart type is required' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    let chartData;

    switch (chartType) {
      case 'sales':
        chartData = await getSalesChartData(businessId, storeId, startDate, endDate);
        break;
      case 'revenue':
        chartData = await getRevenueChartData(businessId, storeId, startDate, endDate);
        break;
      case 'products':
        chartData = await getProductsChartData(businessId, storeId, startDate, endDate);
        break;
      case 'customers':
        chartData = await getCustomersChartData(businessId, storeId, startDate, endDate);
        break;
      case 'payment-methods':
        chartData = await getPaymentMethodsChartData(businessId, storeId, startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid chart type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: chartData,
      chartType,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Error in chart data API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getSalesChartData(businessId: string, storeId: string | null, startDate: string, endDate: string) {
  // Get daily sales data
  let query = supabase
    .from('sale')
    .select('total_amount, created_at, store_id')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (storeId) {
    // Filter by specific store
    query = query.eq('store_id', storeId);
  } else {
    // Get all stores for the business
    const { data: stores } = await supabase
      .from('store')
      .select('id')
      .eq('business_id', businessId);
    
    if (stores && stores.length > 0) {
      const storeIds = stores.map(store => store.id);
      query = query.in('store_id', storeIds);
    } else {
      return {
        labels: [],
        datasets: [{
          label: 'Daily Sales',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      };
    }
  }

  const { data: sales, error } = await query;

  if (error) {
    throw new Error('Failed to fetch sales data');
  }

  // Group by date
  const dailySales = sales?.reduce((acc: Record<string, number>, sale) => {
    const date = new Date(sale.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += sale.total_amount || 0;
    return acc;
  }, {}) || {};

  const labels = Object.keys(dailySales).sort();
  const data = labels.map(date => dailySales[date]);

  return {
    labels,
    datasets: [{
      label: 'Daily Sales',
      data,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };
}

async function getRevenueChartData(businessId: string, storeId: string | null, startDate: string, endDate: string) {
  // Get daily revenue data (same as sales for now)
  return await getSalesChartData(businessId, storeId, startDate, endDate);
}

async function getProductsChartData(businessId: string, storeId: string | null, startDate: string, endDate: string) {
  // First get sales for the store(s) in the date range
  let salesQuery = supabase
    .from('sale')
    .select('id, store_id')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (storeId) {
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
      return {
        labels: [],
        datasets: [{
          label: 'Product Sales',
          data: [],
          backgroundColor: []
        }]
      };
    }
  }

  const { data: sales, error: salesError } = await salesQuery;

  if (salesError) {
    throw new Error('Failed to fetch sales data');
  }

  if (!sales || sales.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Product Sales',
        data: [],
        backgroundColor: []
      }]
    };
  }

  const saleIds = sales.map(sale => sale.id);

  // Get sale items for these sales
  const { data: productSales, error } = await supabase
    .from('sale_item')
    .select(`
      quantity,
      unit_price,
      product:product(
        name,
        id
      )
    `)
    .in('sale_id', saleIds);

  if (error) {
    throw new Error('Failed to fetch product sales data');
  }

  // Group by product
  const productTotals = productSales?.reduce((acc: Record<string, number>, item) => {
    const productName = (item.product as { name?: string })?.name || 'Unknown Product';
    if (!acc[productName]) {
      acc[productName] = 0;
    }
    acc[productName] += (item.quantity * item.unit_price) || 0;
    return acc;
  }, {}) || {};

  // Get top 10 products
  const sortedProducts = Object.entries(productTotals)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10);

  const labels = sortedProducts.map(([name]) => name);
  const data = sortedProducts.map(([, amount]) => amount);

  return {
    labels,
    datasets: [{
      label: 'Product Sales',
      data,
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(255, 99, 255, 0.8)',
        'rgba(99, 255, 132, 0.8)'
      ]
    }]
  };
}

async function getCustomersChartData(businessId: string, storeId: string | null, startDate: string, endDate: string) {
  // Get customer activity data
  let query = supabase
    .from('sale')
    .select('customer_id, created_at, store_id')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .not('customer_id', 'is', null);

  if (storeId) {
    // Filter by specific store
    query = query.eq('store_id', storeId);
  } else {
    // Get all stores for the business
    const { data: stores } = await supabase
      .from('store')
      .select('id')
      .eq('business_id', businessId);
    
    if (stores && stores.length > 0) {
      const storeIds = stores.map(store => store.id);
      query = query.in('store_id', storeIds);
    } else {
      return {
        labels: [],
        datasets: [{
          label: 'Daily Active Customers',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }]
      };
    }
  }

  const { data: sales, error } = await query;

  if (error) {
    throw new Error('Failed to fetch customer data');
  }

  // Group by date
  const dailyCustomers = sales?.reduce((acc: Record<string, Set<string>>, sale) => {
    const date = new Date(sale.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = new Set();
    }
    acc[date].add(sale.customer_id);
    return acc;
  }, {}) || {};

  const labels = Object.keys(dailyCustomers).sort();
  const data = labels.map(date => dailyCustomers[date].size);

  return {
    labels,
    datasets: [{
      label: 'Daily Active Customers',
      data,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.1
    }]
  };
}

async function getPaymentMethodsChartData(businessId: string, storeId: string | null, startDate: string, endDate: string) {
  // Get payment method breakdown
  let query = supabase
    .from('sale')
    .select('total_amount, payment_method, store_id')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (storeId) {
    // Filter by specific store
    query = query.eq('store_id', storeId);
  } else {
    // Get all stores for the business
    const { data: stores } = await supabase
      .from('store')
      .select('id')
      .eq('business_id', businessId);
    
    if (stores && stores.length > 0) {
      const storeIds = stores.map(store => store.id);
      query = query.in('store_id', storeIds);
    } else {
      return {
        labels: [],
        datasets: [{
          label: 'Payment Methods',
          data: [],
          backgroundColor: []
        }]
      };
    }
  }

  const { data: sales, error } = await query;

  if (error) {
    throw new Error('Failed to fetch payment method data');
  }

  // Group by payment method
  const paymentTotals = sales?.reduce((acc: Record<string, number>, sale) => {
    const method = sale.payment_method || 'Unknown';
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += sale.total_amount || 0;
    return acc;
  }, {}) || {};

  const labels = Object.keys(paymentTotals);
  const data = Object.values(paymentTotals);

  return {
    labels,
    datasets: [{
      label: 'Payment Methods',
      data,
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  };
}
