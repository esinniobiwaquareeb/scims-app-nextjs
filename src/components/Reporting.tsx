import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useReportingSales,
  useReportingProductPerformance,
  useReportingCustomerAnalytics,
  useReportingInventoryStats,
  useReportingFinancialMetrics,
  useReportingChartData
} from '@/utils/hooks/reports';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download,
  Loader2,
  BarChart3,
  PieChart,
  ArrowLeft,
  FileText,
  Search,
  RefreshCw,
  Store,
  Building2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Product, Sale, SaleType, CustomerType } from '@/types';

interface ReportingProps {
  onBack?: () => void; // Optional for backward compatibility
}

interface TransformedSalesData {
  id: string;
  date: Date;
  customerName: string;
  products: string[];
  total: number;
  payment: string;
  cashier: string;
  storeId: string;
}

interface RawSalesData {
  id: string;
  created_at?: string;
  transaction_date?: string;
  customers?: { name: string };
  sale_items?: Array<{ products?: { name: string } }>;
  total_amount?: string | number;
  payment_method?: string;
  users?: { username: string };
  store_id?: string;
}

interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  soldQuantity: number;
  revenue: number;
  profit: number;
}

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  totalSpent: number;
  lastVisit: Date;
}

interface TopSaleData {
  id: string;
  date: Date;
  customerName: string;
  amount: number;
  itemsCount: number;
  paymentMethod: string;
  cashier: string;
  storeId: string;
}

export const Reporting: React.FC<ReportingProps> = ({ onBack }) => {
  const { user, currentStore, currentBusiness } = useAuth();
  const { formatCurrency } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState('All');
  
  // Local store state for reporting (can be different from global currentStore)
  const [reportingStoreId, setReportingStoreId] = useState<string>(currentStore?.id || '');

  // Update reporting store when global store changes
  useEffect(() => {
    setReportingStoreId(currentStore?.id || '');
  }, [currentStore?.id]);

  // Memoize date range values for React Query
  const startDate = useMemo(() => dateRange.from?.toISOString(), [dateRange.from]);
  const endDate = useMemo(() => dateRange.to?.toISOString(), [dateRange.to]);

  // React Query hooks for reporting data - now use reportingStoreId
  const {
    data: salesResponse = { sales: [] },
    isLoading: isLoadingSales,
    error: salesError,
    refetch: refetchSales
  } = useReportingSales(
    currentBusiness?.id || '', 
    reportingStoreId || '', 
    startDate,
    endDate
  );

  const {
    data: productResponse = { products: [] },
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts
  } = useReportingProductPerformance(currentBusiness?.id || '', reportingStoreId || '');

  const {
    data: customerResponse = { customers: [] },
    isLoading: isLoadingCustomers,
    error: customersError,
    refetch: refetchCustomers
  } = useReportingCustomerAnalytics(currentBusiness?.id || '', reportingStoreId || '');

  const {
    data: inventoryResponse = { summary: { inStock: 0, lowStock: 0, outOfStock: 0 } },
    isLoading: isLoadingInventory,
    error: inventoryError,
    refetch: refetchInventory
  } = useReportingInventoryStats(currentBusiness?.id || '', reportingStoreId || '');

  const {
    data: financialResponse = {
      summary: {
        totalProfit: 0,
        operatingExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        returnRate: 0,
        customerRetention: 0,
        inventoryTurnover: 0
      }
    },
    isLoading: isLoadingFinancial,
    error: financialError,
    refetch: refetchFinancial
  } = useReportingFinancialMetrics(
    currentBusiness?.id || '', 
    reportingStoreId || '', 
    startDate,
    endDate
  );

  const {
    data: chartResponse = { revenueData: [], categoryData: [], paymentData: [] },
    isLoading: isLoadingCharts,
    error: chartsError,
    refetch: refetchCharts
  } = useReportingChartData(
    currentBusiness?.id || '', 
    'sales', 
    reportingStoreId || '', 
    startDate,
    endDate
  );

  // Extract the actual data from the API responses
  const salesData = salesResponse?.sales || [];
  const productPerformance = productResponse?.products || [];
  const customerData = customerResponse?.customers || [];
  const inventoryStats = inventoryResponse?.summary || { inStock: 0, lowStock: 0, outOfStock: 0 };
  const financialStats = financialResponse?.summary || {
    totalProfit: 0,
    operatingExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    returnRate: 0,
    customerRetention: 0,
    inventoryTurnover: 0
  };
  const chartData = chartResponse || { revenueData: [], categoryData: [], paymentData: [] };

  // Ensure chartData properties are always arrays to prevent runtime errors
  const safeChartData = {
    revenueData: Array.isArray(chartData?.revenueData) ? chartData.revenueData : [],
    categoryData: Array.isArray(chartData?.categoryData) ? chartData.categoryData : [],
    paymentData: Array.isArray(chartData?.paymentData) ? chartData.paymentData : []
  };

  // Ensure financial stats are always numbers to prevent runtime errors
  const safeFinancialStats = {
    totalProfit: typeof financialStats?.totalProfit === 'number' ? financialStats.totalProfit : 0,
    operatingExpenses: typeof financialStats?.operatingExpenses === 'number' ? financialStats.operatingExpenses : 0,
    netProfit: typeof financialStats?.netProfit === 'number' ? financialStats.netProfit : 0,
    profitMargin: typeof financialStats?.profitMargin === 'number' ? financialStats.profitMargin : 0,
    returnRate: typeof financialStats?.returnRate === 'number' ? financialStats.returnRate : 0,
    customerRetention: typeof financialStats?.customerRetention === 'number' ? financialStats.customerRetention : 0,
    inventoryTurnover: typeof financialStats?.inventoryTurnover === 'number' ? financialStats.inventoryTurnover : 0
  };

  // Combined loading states
  const isLoading = isLoadingSales || isLoadingProducts || isLoadingCustomers || isLoadingInventory || isLoadingFinancial || isLoadingCharts;

  // Combined error state
  const hasError = salesError || productsError || customersError || inventoryError || financialError || chartsError;

  // Refresh function for manual data refresh
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchSales(),
        refetchProducts(),
        refetchCustomers(),
        refetchInventory(),
        refetchFinancial(),
        refetchCharts()
      ]);
      toast.success('Reports refreshed successfully');
    } catch (error) {
      console.error('Error refreshing reports:', error);
      toast.error('Failed to refresh reports');
    }
  }, [refetchSales, refetchProducts, refetchCustomers, refetchInventory, refetchFinancial, refetchCharts]);

  const exportToPDF = (reportType: string) => {
    // PDF export functionality not yet implemented
    toast.info(`${reportType} PDF export coming soon!`);
  };

  const exportToCSV = (reportType: string, data: unknown[]) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Convert data to CSV format
      const headers = Object.keys(data[0] as Record<string, unknown>);
      const csvContent = [
        headers.join(','),
        ...data.map((row: unknown) => 
          headers.map(header => {
            const value = (row as Record<string, unknown>)[header];
            // Escape commas and quotes in CSV
            const stringValue = String(value || '').replace(/"/g, '""');
            return `"${stringValue}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${reportType} exported to CSV successfully`);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

    // Transform sales data for display
  const transformedSalesData = useMemo(() => {

    
    return salesData.map((sale: RawSalesData) => {
      // Ensure products array is always defined
      let products: string[] = [];
      if (sale.sale_items && Array.isArray(sale.sale_items)) {
        products = sale.sale_items.map((item: { products?: { name: string } }) => 
          item.products?.name || 'Unknown Product'
        );
      }
      

      
      return {
        id: sale.id,
        date: new Date(sale.created_at || sale.transaction_date || ''),
        customerName: sale.customers?.name || 'Walk-in Customer',
        products: products,
        total: parseFloat(String(sale.total_amount || 0)),
        payment: sale.payment_method || 'cash',
        cashier: sale.users?.username || 'Unknown',
        storeId: sale.store_id || ''
      };
    });
  }, [salesData]);

  const filteredSales = transformedSalesData.filter((sale: TransformedSalesData) => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.products.some((p: string) => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPayment = selectedPayment === 'All' || sale.payment === selectedPayment.toLowerCase();
    const matchesDate = dateRange.from && dateRange.to ? 
      (sale.date >= dateRange.from && sale.date <= dateRange.to) : true;
    const matchesStore = !currentStore || sale.storeId === currentStore.id;
    return matchesSearch && matchesPayment && matchesDate && matchesStore;
  });

  const filteredProducts = productPerformance.filter((product: ProductPerformance) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRevenue = filteredSales.reduce((sum: number, sale: TransformedSalesData) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const topSales = useMemo(() => {
    const sales = filteredSales.map((sale: TransformedSalesData) => {
      // Ensure products array is safe to access
      const itemsCount = sale.products && Array.isArray(sale.products) ? sale.products.length : 0;
      
      return {
        id: sale.id,
        date: sale.date,
        customerName: sale.customerName,
        amount: sale.total,
        itemsCount: itemsCount,
        paymentMethod: sale.payment.charAt(0).toUpperCase() + sale.payment.slice(1),
        cashier: sale.cashier,
        storeId: sale.storeId
      };
    });

    return sales.sort((a: TopSaleData, b: TopSaleData) => b.amount - a.amount).slice(0, 10);
  }, [filteredSales]);

  // Show loading state for initial data fetch
  if (isLoading && (!salesData.length && !productPerformance.length && !customerData.length)) {
    return (
      <DashboardLayout
        title="Reports & Analytics"
        subtitle="Loading reports and analytics..."
      >
        <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reports and analytics...</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Reports & Analytics"
      subtitle={
        reportingStoreId ? 
          `${currentBusiness?.stores?.find(s => s.id === reportingStoreId)?.name || 'Store'} - Comprehensive business insights` : 
          'All Stores - Comprehensive business insights'
      }
      headerActions={
            <div className="flex gap-2">
              {/* Store Selector */}
              {currentBusiness && currentBusiness.stores.length > 0 && user?.role !== 'cashier' && user?.role !== 'store_admin' && (
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border">
                  <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Select 
                    value={reportingStoreId || 'all'} 
                    onValueChange={(value) => {
                      if (value === 'all') {
                        // Clear current store selection to show all stores combined
                        setReportingStoreId('');
                      } else {
                        // Switch to specific store
                        setReportingStoreId(value);
                      }
                    }}
                  >
                    <SelectTrigger className="border-0 shadow-none h-auto p-0 font-medium bg-transparent">
                      <SelectValue placeholder="Select Store">
                        <span className="truncate max-w-32 sm:max-w-none">
                          {currentStore?.name || (
                            <span className="flex items-center gap-2 text-blue-600">
                              <Building2 className="w-4 h-4" />
                              All Stores
                            </span>
                          )}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-medium">All Stores</p>
                            <p className="text-sm text-muted-foreground">Combined view</p>
                          </div>
                        </div>
                      </SelectItem>
                      {currentBusiness.stores.map((store: { id: string; name: string; address?: string }) => (
                        <SelectItem key={store.id} value={store.id}>
                          <div>
                            <p className="font-medium">{store.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-60">
                              {store.address}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Store display for store admins (read-only) */}
              {user?.role === 'store_admin' && currentStore && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                  <Store className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm font-medium text-blue-700">
                    {currentStore.name}
                  </span>
                </div>
              )}

              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => exportToPDF('Complete Report')}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => exportToCSV('All Data', [...filteredSales, ...filteredProducts])}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
      }
    >
        {/* Error Display */}
        {hasError && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">
                {salesError?.message || productsError?.message || customersError?.message || 
                 inventoryError?.message || financialError?.message || chartsError?.message || 
                 'Failed to load reporting data'}
              </p>
              <Button onClick={handleRefresh} className="mt-2" variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Store Selection Notice */}
        {!reportingStoreId && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium">Business-Wide View</p>
                  <p className="text-blue-700 text-sm">
                    You are viewing combined data from all stores. Product performance, customer analytics, 
                    and inventory statistics are aggregated across your entire business. 
                    Select a specific store for store-level detailed reports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      +{isLoading ? '...' : (safeFinancialStats.profitMargin > 0 ? safeFinancialStats.profitMargin.toFixed(1) : '0.0')}%
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalTransactions}
                  </p>
                  <p className="text-sm text-muted-foreground">This period</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(averageOrderValue)}
                  </p>
                  <p className="text-sm text-blue-600">Per transaction</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Products</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : productPerformance.length}
                  </p>
                  <p className="text-sm text-orange-600">
                    {!reportingStoreId ? 'All stores' : 'Store items'}
                  </p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search products, customers..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Date Range</Label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={(date) => {
                    if (date) {
                      setDateRange({
                        from: date.from ?? dateRange.from,
                        to: date.to ?? dateRange.to,
                      })
                    }
                  }}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Methods</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCharts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading revenue data...</p>
                </div>
              ) : safeChartData.revenueData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No revenue data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={safeChartData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCharts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading category data...</p>
                </div>
              ) : safeChartData.categoryData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No category data available
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={safeChartData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {safeChartData.categoryData.map((entry: { color: string }, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center flex-wrap gap-4 mt-4">
                    {safeChartData.categoryData.map((item: { color: string; name: string; value: number }, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Reports */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="products">Product Performance</TabsTrigger>
            <TabsTrigger value="customers">Customer Report</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
            <TabsTrigger value="financial">Financial Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            {/* Top Sales DataTable */}
            <Card>
              <CardHeader>
                <CardTitle>Top Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  title=""
                  data={topSales}
                  columns={[
                    {
                      key: 'date',
                      header: 'Date',
                      render: (sale: TopSaleData) => (
                        <div>{sale.date.toLocaleDateString()}</div>
                      )
                    },
                    {
                      key: 'customer',
                      header: 'Customer',
                      render: (sale: TopSaleData) => (
                        <div>{sale.customerName}</div>
                      )
                    },
                    {
                      key: 'amount',
                      header: 'Amount',
                      render: (sale: TopSaleData) => (
                        <div className="font-medium">{formatCurrency(sale.amount)}</div>
                      )
                    },
                    {
                      key: 'items',
                      header: 'Items',
                      render: (sale: TopSaleData) => (
                        <div>{sale.itemsCount}</div>
                      )
                    },
                    {
                      key: 'payment',
                      header: 'Payment',
                      render: (sale: TopSaleData) => (
                        <Badge variant="outline">{sale.paymentMethod}</Badge>
                      )
                    },
                    {
                      key: 'cashier',
                      header: 'Cashier',
                      render: (sale: TopSaleData) => (
                        <div>{sale.cashier}</div>
                      )
                    }
                  ]}
                  searchable={false}
                  tableName="reports"
                  userRole={user?.role}
                  pagination={{
                    enabled: true,
                    pageSize: 10,
                    showPageSizeSelector: false,
                    showPageInfo: true
                  }}
                  emptyMessage="No sales data available"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Performance ({filteredProducts.length})</CardTitle>
                  <Button variant="outline" onClick={() => exportToCSV('Product Performance', filteredProducts)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading product performance data...</p>
                  </div>
                ) : (
                  <DataTable
                    title=""
                    data={filteredProducts}
                    columns={[
                      {
                        key: 'product',
                        header: 'Product',
                        render: (product: Product) => (
                          <div className="font-medium">{product.name}</div>
                        )
                      },
                      {
                        key: 'category',
                        header: 'Category',
                        render: (product: Product) => (
                          <div>{product.category}</div>
                        )
                      },
                      {
                        key: 'soldQty',
                        header: 'Sold Qty',
                        render: (product: Product) => (
                          <div>{product.soldQuantity}</div>
                        )
                      },
                      {
                        key: 'revenue',
                        header: 'Revenue',
                        render: (product: Product) => (
                          <div>{formatCurrency(product.revenue)}</div>
                        )
                      },
                      {
                        key: 'profit',
                        header: 'Profit',
                        render: (product: Product) => (
                          <div className="text-green-600">{formatCurrency(product.profit)}</div>
                        )
                      },
                      {
                        key: 'profitMargin',
                        header: 'Profit Margin',
                        render: (product: Product) => (
                          <Badge variant="secondary">
                            {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : '0.0'}%
                          </Badge>
                        )
                      }
                    ]}
                    searchable={false}
                    tableName="reports"
                    userRole={user?.role}
                    pagination={{
                      enabled: true,
                      pageSize: 15,
                      showPageSizeSelector: false,
                      showPageInfo: true
                    }}
                    emptyMessage="No product performance data available"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Analytics ({customerData.length})</CardTitle>
                  <Button variant="outline" onClick={() => exportToCSV('Customer Report', customerData)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCustomers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading customer analytics data...</p>
                  </div>
                ) : (
                  <DataTable
                    title=""
                    data={customerData}
                    columns={[
                      {
                        key: 'customer',
                        header: 'Customer',
                        render: (customer: CustomerType) => (
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        )
                      },
                      {
                        key: 'contact',
                        header: 'Contact',
                        render: (customer: CustomerType) => (
                          <div>{customer.phone}</div>
                        )
                      },
                      {
                        key: 'totalPurchases',
                        header: 'Total Purchases',
                        render: (customer: CustomerType) => (
                          <div>{customer.total_purchases}</div>
                        )
                      },
                      {
                        key: 'totalSpent',
                        header: 'Total Spent',
                        render: (customer: CustomerType) => (
                          <div className="font-medium">{formatCurrency(customer?.total_purchases || 0)}</div>
                        )
                      },
                      {
                        key: 'avgOrderValue',
                        header: 'Avg Order Value',
                        render: (customer: CustomerType) => (
                          <div>{formatCurrency((customer?.total_purchases || 0) > 0 ? ((customer?.total_purchases || 0) / (customer?.total_purchases || 1)) : 0)}</div>
                        )
                      },
                      {
                        key: 'lastVisit',
                        header: 'Last Visit',
                        render: (customer: CustomerType) => (
                          <div>{customer?.last_purchase_at ? new Date(customer.last_purchase_at).toLocaleDateString() : 'Never'}</div>
                        )
                      }
                    ]}
                    searchable={false}
                    tableName="reports"
                    userRole={user?.role}
                    pagination={{
                      enabled: true,
                      pageSize: 15,
                      showPageSizeSelector: false,
                      showPageInfo: true
                    }}
                    emptyMessage="No customer analytics data available"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingInventory ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading inventory data...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-green-600">
                          {isLoadingInventory ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : inventoryStats.inStock}
                        </p>
                        <p className="text-sm text-muted-foreground">In Stock Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-orange-600">
                          {isLoadingInventory ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : inventoryStats.lowStock}
                        </p>
                        <p className="text-sm text-muted-foreground">Low Stock Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-red-600">
                          {isLoadingInventory ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : inventoryStats.outOfStock}
                        </p>
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCharts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading payment data...</p>
                    </div>
                  ) : safeChartData.paymentData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No payment method data available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {safeChartData.paymentData.map((payment: { method: string; count: number; percentage: number }, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${
                              payment.method === 'Card' ? 'bg-blue-500' :
                              payment.method === 'Cash' ? 'bg-green-500' : 'bg-purple-500'
                            }`} />
                            <span className="font-medium">{payment.method}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{payment.count} transactions</p>
                            <p className="text-sm text-muted-foreground">{payment.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingFinancial ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading financial data...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Gross Revenue</span>
                        <span className="font-semibold">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : formatCurrency(totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Profit</span>
                        <span className="font-semibold text-green-600">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : formatCurrency(safeFinancialStats.totalProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Operating Expenses</span>
                        <span className="font-semibold text-red-600">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : formatCurrency(safeFinancialStats.operatingExpenses)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-medium">Net Profit</span>
                        <span className="font-semibold text-green-600">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : formatCurrency(safeFinancialStats.netProfit)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingFinancial ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading metrics data...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Profit Margin</span>
                        <Badge variant="secondary">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : `${safeFinancialStats.profitMargin.toFixed(1)}%`}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Return Rate</span>
                        <Badge variant="secondary">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : `${safeFinancialStats.returnRate.toFixed(1)}%`}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Customer Retention</span>
                        <Badge variant="default">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : `${safeFinancialStats.customerRetention.toFixed(1)}%`}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Inventory Turnover</span>
                        <Badge variant="secondary">
                          {isLoadingFinancial ? <Loader2 className="w-4 h-4 animate-spin" /> : `${safeFinancialStats.inventoryTurnover.toFixed(1)}x`}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </DashboardLayout>
  );
};