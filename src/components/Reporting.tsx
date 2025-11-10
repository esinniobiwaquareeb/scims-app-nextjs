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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { 
  useReportingSales,
  useReportingProductPerformance,
  useReportingCustomerAnalytics,
  useReportingInventoryStats,
  useReportingFinancialMetrics,
  useReportingChartData
} from '@/utils/hooks/reports';
import { useBusinessCategories } from '@/utils/hooks/categories';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Download,
  Loader2,
  BarChart3,
  FileText,
  Search,
  RefreshCw,
  Store,
  Building2,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Product, CustomerType } from '@/types';

interface ReportingProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack?: () => void; // Optional for backward compatibility
}

interface TransformedSalesData {
  id: string;
  date: Date;
  customerName: string;
  products: string[];
  itemsCount?: number;
  total: number;
  payment: string;
  cashier: string;
  storeId: string;
}

interface RawSalesData {
  id: string;
  created_at?: string;
  transaction_date?: string;
  customer?: { name: string; phone?: string };
  customers?: { name: string; phone?: string };
  sale_item?: Array<{ product?: { name: string }; quantity?: number; total_price?: number }>;
  sale_items?: Array<{ products?: { name: string }; product?: { name: string }; quantity?: number }>;
  total_amount?: string | number;
  payment_method?: string;
  cashier?: { username: string; name?: string };
  users?: { username: string; name?: string };
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
  const [filtersOpen, setFiltersOpen] = useState(true);
  
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
  } = useReportingProductPerformance(currentBusiness?.id || '', reportingStoreId || '', startDate, endDate);

  const {
    data: customerResponse = { customers: [] },
    isLoading: isLoadingCustomers,
    error: customersError,
    refetch: refetchCustomers
  } = useReportingCustomerAnalytics(currentBusiness?.id || '', reportingStoreId || '');

  const {
    data: inventoryResponse = { summary: { inStock: 0, lowStock: 0, outOfStock: 0 }, products: [] },
    isLoading: isLoadingInventory,
    error: inventoryError,
    refetch: refetchInventory
  } = useReportingInventoryStats(currentBusiness?.id || '', reportingStoreId || '', startDate, endDate);

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

  // Fetch categories for filter dropdown
  const { data: categoriesData = [] } = useBusinessCategories(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });
  const availableCategories = Array.isArray(categoriesData) ? categoriesData : [];

  // Extract the actual data from the API responses
  const salesData = salesResponse?.sales || [];
  const productPerformance = productResponse?.products || [];
  const customerData = customerResponse?.customers || [];
  const inventoryStats = inventoryResponse?.summary || { inStock: 0, lowStock: 0, outOfStock: 0 };
  const inventoryProducts = inventoryResponse?.products || [];

  // Extract unique payment methods from sales data
  const availablePaymentMethods = useMemo(() => {
    const methods = new Set<string>();
    salesData.forEach((sale: RawSalesData) => {
      if (sale.payment_method) {
        methods.add(sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1));
      }
    });
    return Array.from(methods).sort();
  }, [salesData]);
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
      // Extract sale items - API returns it as sale_item (singular) not sale_items (plural)
      let products: string[] = [];
      let itemsCount = 0;
      if (sale.sale_item && Array.isArray(sale.sale_item)) {
        products = sale.sale_item.map((item: { product?: { name: string }; quantity?: number }) => {
          itemsCount += item.quantity || 0;
          return item.product?.name || 'Unknown Product';
        });
      } else if (sale.sale_items && Array.isArray(sale.sale_items)) {
        products = sale.sale_items.map((item: { products?: { name: string }; product?: { name: string }; quantity?: number }) => {
          itemsCount += item.quantity || 0;
          return item.product?.name || item.products?.name || 'Unknown Product';
        });
      }
      
      return {
        id: sale.id,
        date: new Date(sale.created_at || sale.transaction_date || ''),
        customerName: sale.customer?.name || sale.customers?.name || 'Walk-in Customer',
        products: products,
        itemsCount: itemsCount,
        total: parseFloat(String(sale.total_amount || 0)),
        payment: sale.payment_method || 'cash',
        cashier: sale.cashier?.username || sale.cashier?.name || sale.users?.username || sale.users?.name || 'Unknown',
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
    const sales = filteredSales.map((sale: TransformedSalesData & { itemsCount?: number }) => {
      // Use itemsCount from transformed data, or fallback to products array length
      const itemsCount = sale.itemsCount || (sale.products && Array.isArray(sale.products) ? sale.products.length : 0);
      
      return {
        id: sale.id,
        date: sale.date,
        customerName: sale.customerName,
        amount: sale.total,
        itemsCount: itemsCount,
        paymentMethod: sale.payment ? sale.payment.charAt(0).toUpperCase() + sale.payment.slice(1) : 'Cash',
        cashier: sale.cashier,
        storeId: sale.storeId
      };
    });

    return sales.sort((a: TopSaleData, b: TopSaleData) => b.amount - a.amount).slice(0, 10);
  }, [filteredSales]);

  // Quick date range presets
  const setQuickDateRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({ from: start, to: end });
  }, []);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== 'All') count++;
    if (selectedPayment !== 'All') count++;
    if (dateRange.from || dateRange.to) count++;
    return count;
  }, [searchTerm, selectedCategory, selectedPayment, dateRange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedPayment('All');
    setDateRange({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  }, []);

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
          `${currentBusiness?.stores?.find(s => s.id === reportingStoreId)?.name || 'Store'} insights` : 
          'Comprehensive business insights'
      }
      headerActions={
            <>

              {/* Store display for store admins (read-only) */}
              {user?.role === 'store_admin' && currentStore && (
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 truncate max-w-[100px] sm:max-w-none">
                    {currentStore.name}
                  </span>
                </div>
              )}

              {/* Action Buttons Group */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh} 
                  disabled={isLoading}
                  className="h-8 sm:h-9 px-2 sm:px-3"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline ml-1.5 sm:ml-2 text-xs sm:text-sm">Refresh</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 sm:h-9 px-2 sm:px-3"
                      title="Export reports"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-1.5 sm:ml-2 text-xs sm:text-sm">Export</span>
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:inline ml-1 sm:ml-1.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">Export Reports</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportToCSV('Sales Report', filteredSales)} className="text-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Sales as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToCSV('Product Performance', filteredProducts)} className="text-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Products as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToCSV('Customer Report', customerData)} className="text-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Customers as CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportToPDF('Complete Report')} className="text-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      All Reports (PDF)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
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
        {!reportingStoreId && currentBusiness && currentBusiness.stores && currentBusiness.stores.length > 1 && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">Business-Wide View</p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Viewing aggregated data from all {currentBusiness.stores.length} stores. Select a specific store above for detailed reports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold mb-1">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatCurrency(totalRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      {isLoading ? '...' : (safeFinancialStats.profitMargin > 0 ? safeFinancialStats.profitMargin.toFixed(1) : '0.0')}% margin
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Orders</p>
                  <p className="text-2xl font-bold mb-1">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalTransactions.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">In selected period</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold mb-1">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatCurrency(averageOrderValue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Per transaction</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Products Sold</p>
                  <p className="text-2xl font-bold mb-1">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : productPerformance.length.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {!reportingStoreId ? 'Across all stores' : 'In this store'}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 overflow-visible">
          <CardHeader 
            className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Filters</CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
                {filtersOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          
          {filtersOpen && (
            <CardContent className="pt-0 overflow-visible">
              {/* Quick Date Range Buttons */}
              <div className="mb-4 pb-4 border-b">
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Quick Date Range</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={dateRange.from && dateRange.to && 
                      Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) === 0 
                      ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setDateRange({ from: today, to: today });
                    }}
                    className="h-8 text-xs"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange(7)}
                    className="h-8 text-xs"
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange(30)}
                    className="h-8 text-xs"
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDateRange(90)}
                    className="h-8 text-xs"
                  >
                    Last 90 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      setDateRange({ from: firstDay, to: today });
                    }}
                    className="h-8 text-xs"
                  >
                    This Month
                  </Button>
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="search" className="text-xs font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search products, customers..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 min-w-0 relative z-10">
                  <Label className="text-xs font-medium">Date Range</Label>
                  <div className="w-full">
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
                </div>

                <div className="space-y-2 min-w-0 relative z-10">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="All">All Categories</SelectItem>
                      {availableCategories.map((category: { id: string; name: string }) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 min-w-0 relative z-10">
                  <Label className="text-xs font-medium">Payment Method</Label>
                  <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="All">All Methods</SelectItem>
                      {availablePaymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          )}
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
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sales by Category</CardTitle>
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
        <Tabs defaultValue="sales" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="sales" className="data-[state=active]:bg-background">Sales</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-background">Products</TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-background">Customers</TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-background">Inventory</TabsTrigger>
              <TabsTrigger value="financial" className="data-[state=active]:bg-background">Financial</TabsTrigger>
            </TabsList>
          </div>

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

          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Product Performance</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {filteredProducts.length} products
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV('Product Performance', filteredProducts)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading product performance data...</p>
                  </div>
                ) : productsError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive mb-2">Error loading product performance data</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {productsError instanceof Error ? productsError.message : 'Something went wrong'}
                    </p>
                    <Button variant="outline" onClick={() => refetchProducts()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
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
                          <div className="font-medium">{product.name || 'Unknown Product'}</div>
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

          <TabsContent value="customers" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Customer Analytics</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {customerData.length} customers
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV('Customer Report', customerData)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
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
                        render: (customer: CustomerType) => {
                          const customerWithStats = customer as CustomerType & { total_spent?: number };
                          return (
                            <div className="font-medium">{formatCurrency(customerWithStats?.total_spent || 0)}</div>
                          );
                        }
                      },
                      {
                        key: 'avgOrderValue',
                        header: 'Avg Order Value',
                        render: (customer: CustomerType) => {
                          const customerWithStats = customer as CustomerType & { average_order_value?: number };
                          return (
                            <div>{formatCurrency(customerWithStats?.average_order_value || 0)}</div>
                          );
                        }
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

          <TabsContent value="inventory" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Inventory Status</CardTitle>
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
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Stock Tracking & Balance</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => exportToCSV('Stock Tracking', inventoryProducts)}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  {dateRange.from && dateRange.to && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing stock movements from {dateRange.from.toLocaleDateString()} to {dateRange.to.toLocaleDateString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoadingInventory ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading inventory products...</p>
                    </div>
                  ) : inventoryProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No inventory products found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 text-sm font-medium">Product</th>
                            <th className="text-left p-3 text-sm font-medium">SKU</th>
                            <th className="text-center p-3 text-sm font-medium">Initial Stock</th>
                            <th className="text-center p-3 text-sm font-medium">Sold</th>
                            <th className="text-center p-3 text-sm font-medium">Restocked</th>
                            <th className="text-center p-3 text-sm font-medium">Current Stock</th>
                            <th className="text-center p-3 text-sm font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryProducts.map((product: {
                            id: string;
                            name: string;
                            sku?: string;
                            stock_quantity?: number;
                            reorder_level?: number;
                            category?: { name: string };
                            brand?: { name: string };
                            initialStock?: number;
                            quantitySold?: number;
                            quantityRestocked?: number;
                            currentStock?: number;
                          }) => {
                            const initialStock = product.initialStock ?? product.stock_quantity ?? 0;
                            const quantitySold = product.quantitySold ?? 0;
                            const quantityRestocked = product.quantityRestocked ?? 0;
                            const currentStock = product.currentStock ?? product.stock_quantity ?? 0;
                            
                            const stockStatus = 
                              currentStock <= 0 ? 'outOfStock' :
                              currentStock <= (product.reorder_level || 0) ? 'lowStock' :
                              'inStock';
                            
                            const statusColor = 
                              stockStatus === 'outOfStock' ? 'text-red-600' :
                              stockStatus === 'lowStock' ? 'text-orange-600' :
                              'text-green-600';
                            
                            const statusLabel = 
                              stockStatus === 'outOfStock' ? 'Out of Stock' :
                              stockStatus === 'lowStock' ? 'Low Stock' :
                              'In Stock';

                            // Calculate expected stock for balance check
                            const expectedStock = initialStock - quantitySold + quantityRestocked;
                            const stockDifference = currentStock - expectedStock;
                            const isBalanced = Math.abs(stockDifference) <= 1; // Allow 1 unit difference for rounding

                            return (
                              <tr key={product.id} className="border-b hover:bg-muted/50">
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                      {product.category?.name && <span>{product.category.name}</span>}
                                      {product.brand?.name && <span>• {product.brand.name}</span>}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-sm">{product.sku || 'N/A'}</td>
                                <td className="p-3 text-center text-sm font-medium">{initialStock}</td>
                                <td className="p-3 text-center text-sm text-red-600 font-medium">-{quantitySold}</td>
                                <td className="p-3 text-center text-sm text-green-600 font-medium">+{quantityRestocked}</td>
                                <td className="p-3 text-center">
                                  <div>
                                    <p className="text-sm font-semibold">{currentStock}</p>
                                    {!isBalanced && (
                                      <p className="text-xs text-orange-600 mt-1">
                                        Expected: {expectedStock}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant="outline" className={statusColor}>
                                    {statusLabel}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Key Metrics</CardTitle>
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