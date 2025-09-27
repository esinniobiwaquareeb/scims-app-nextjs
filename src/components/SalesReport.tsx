/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { Header } from '@/components/common/Header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DatePickerWithRange } from './ui/date-range-picker';
import { DataTable } from './common/DataTable';
import { 
  useStoreSalesReport,
  useBusinessStoresReport,
  useAggregatedSalesReport
} from '../utils/hooks/useStoreData';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Download,
  Filter,
  Search,
  BarChart3,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  CreditCard,
  Receipt,
  Store,
  Target,
  Award,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
// Import types from centralized location
import { 
  SalesReportProps,
  SalesReportSale,
  SalesReportSaleItem,
  SalesReportStats
} from '@/types';

interface FilterOptions {
  dateRange: { from: Date | undefined; to: Date | undefined };
  paymentMethod: string;
  status: string;
  cashier: string;
  customer: string;
  category: string;
  minAmount: number;
  maxAmount: number;
}


export const SalesReport: React.FC<SalesReportProps> = ({ onBack }) => {
  const { user, currentStore, currentBusiness } = useAuth();
  const { translate, formatCurrency, formatDateTime, formatTime, formatDate } = useSystem();
  const { logActivity } = useActivityLogger();
  
  // State
  const [filteredSales, setFilteredSales] = useState<SalesReportSale[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() },
    paymentMethod: 'All',
    status: 'All',
    cashier: 'All',
    customer: 'All',
    category: 'All',
    minAmount: 0,
    maxAmount: 999999
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availableCashiers, setAvailableCashiers] = useState<string[]>([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>([]);
  const [selectedSale, setSelectedSale] = useState<SalesReportSale | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Debounced filter values using useMemo to prevent excessive re-renders
  const debouncedFilters = useMemo(() => filters, [filters]);
  const debouncedSearchTerm = useMemo(() => searchTerm, [searchTerm]);

  // Memoize date range values to prevent unnecessary React Query hook recreations
  const startDate = useMemo(() => 
    debouncedFilters.dateRange.from?.toISOString(), 
    [debouncedFilters.dateRange.from]
  );
  
  const endDate = useMemo(() => 
    debouncedFilters.dateRange.to?.toISOString(), 
    [debouncedFilters.dateRange.to]
  );

  // React Query hooks for data fetching
  const {
    data: businessStoresResponse,
    isLoading: isLoadingBusinessStores,
    error: businessStoresError,
    refetch: refetchBusinessStores
  } = useBusinessStoresReport(currentBusiness?.id || '', {
    enabled: user?.role === 'business_admin' && !!currentBusiness?.id
  });

  const businessStores = businessStoresResponse?.stores || [];

  // Memoize store IDs to prevent React Query hook recreation
  const storeIds = useMemo(() => 
    businessStores.map((store: any) => store.id),
    [businessStores]
  );

  const {
    data: storeSales = [],
    isLoading: isLoadingStoreSales,
    error: storeSalesError,
    refetch: refetchStoreSales
  } = useStoreSalesReport(currentStore?.id || '', {
    enabled: !!currentStore?.id,
    startDate,
    endDate
  });

  const {
    data: aggregatedSales = [],
    isLoading: isLoadingAggregatedSales,
    error: aggregatedSalesError,
    refetch: refetchAggregatedSales
  } = useAggregatedSalesReport(storeIds, {
    enabled: user?.role === 'business_admin' && storeIds.length > 0,
    startDate,
    endDate
  });

  // Determine which sales data to use based on user role
  const sales = useMemo(() => {
    if (user?.role === 'business_admin' && aggregatedSales.length > 0) {
      return aggregatedSales;
    } else if (storeSales.length > 0) {
      return storeSales;
    }
    return [];
  }, [user?.role, aggregatedSales, storeSales]);

  // Memoize the sales array reference to prevent unnecessary re-renders
  const stableSales = useMemo(() => sales, [sales.length, sales[0]?.id, sales[sales.length - 1]?.id]);

  // Role-based loading state
  const isLoading = useMemo(() => {
    if (user?.role === 'business_admin') {
      return isLoadingBusinessStores || isLoadingStoreSales || isLoadingAggregatedSales;
    } else {
      return isLoadingStoreSales;
    }
  }, [user?.role, isLoadingBusinessStores, isLoadingStoreSales, isLoadingAggregatedSales]);

  // Role-based error state
  const hasError = useMemo(() => {
    if (user?.role === 'business_admin') {
      return businessStoresError || storeSalesError || aggregatedSalesError;
    } else {
      return storeSalesError;
    }
  }, [user?.role, businessStoresError, storeSalesError, aggregatedSalesError]);

  // Refresh function - role-based refresh
  const handleRefresh = useCallback(async () => {
    try {
      if (user?.role === 'business_admin') {
        // Business admin can refresh all data
        await Promise.all([
          refetchBusinessStores(),
          refetchStoreSales(),
          refetchAggregatedSales()
        ]);
      } else {
        // Store admin only refreshes their store's data
        await refetchStoreSales();
      }
      
      // Log the refresh activity
      logActivity('report_generate', 'Sales Report', `Manually refreshed sales report`, {
        total_sales: stableSales.length,
        date_range: `${startDate ? formatDate(new Date(startDate)) : 'N/A'} - ${endDate ? formatDate(new Date(endDate)) : 'N/A'}`
      });
      
      toast.success('Sales data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh sales data');
    }
  }, [user?.role, refetchBusinessStores, refetchStoreSales, refetchAggregatedSales, logActivity, stableSales.length, startDate, endDate]);

  // Extract available filter options when sales data changes
  useEffect(() => {
    if (stableSales.length > 0) {
      // Memoize the filter options extraction to prevent unnecessary re-renders
      const extractFilterOptions = () => {
        // Filter out undefined/null values and ensure uniqueness
        const cashiers = Array.from(new Set(
          stableSales
            .map((sale: SalesReportSale) => sale.cashier?.username || sale.cashier?.name || sale.users?.username)
            .filter(Boolean) // Remove undefined/null values
        ));
        
        const categories = Array.from(new Set(
          stableSales
            .flatMap((sale: SalesReportSale) => 
              sale.sale_items?.map((item: SalesReportSaleItem) => item.products?.categories?.name) || []
            )
            .filter(Boolean) // Remove undefined/null values
        ));
        
        const paymentMethods = Array.from(new Set(
          stableSales
            .map((sale: SalesReportSale) => sale.payment_method)
            .filter(Boolean) // Remove undefined/null values
        ));

        return { cashiers, categories, paymentMethods };
      };

      const { cashiers, paymentMethods } = extractFilterOptions();
      
      // Ensure we always have valid arrays with fallbacks
      setAvailableCashiers(['All', ...(cashiers.length > 0 ? cashiers as string[] : ['No cashiers found'])]);
      setAvailablePaymentMethods(['All', ...(paymentMethods.length > 0 ? paymentMethods as string[] : ['No payment methods found'])]);
    }
  }, [stableSales]);

  // Remove the problematic activity logging useEffect completely
  // Activity logging will be handled by user interactions instead

  // Calculate filtered sales and stats
  useEffect(() => {
    const filtered = stableSales.filter((sale: SalesReportSale) => {
      const saleDate = new Date(sale.transaction_date || sale.created_at);
      
      // Date range filter
      if (debouncedFilters.dateRange.from && debouncedFilters.dateRange.to) {
        const fromDate = debouncedFilters.dateRange.from;
        const toDate = debouncedFilters.dateRange.to;
        if (saleDate < fromDate || saleDate > toDate) return false;
      }
      
      // Payment method filter
      if (debouncedFilters.paymentMethod !== 'All' && sale.payment_method !== debouncedFilters.paymentMethod) return false;
      
      // Status filter
      if (debouncedFilters.status !== 'All' && sale.status !== debouncedFilters.status) return false;
      
      // Cashier filter
      if (debouncedFilters.cashier !== 'All' && 
          sale.cashier?.username !== debouncedFilters.cashier && 
          sale.cashier?.name !== debouncedFilters.cashier && 
          sale.users?.username !== debouncedFilters.cashier) return false;
      
      // Amount range filter
      if (sale.total_amount < debouncedFilters.minAmount || sale.total_amount > debouncedFilters.maxAmount) return false;
      
      // Search term filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesReceipt = sale.receipt_number.toLowerCase().includes(searchLower);
        const matchesCustomer = sale.customer?.name?.toLowerCase().includes(searchLower) ||
                              sale.customer?.phone?.includes(debouncedSearchTerm) ||
                              sale.customer?.email?.toLowerCase().includes(searchLower);
        const matchesProduct = sale.sale_items?.some((item: SalesReportSaleItem) => 
          item.products?.name.toLowerCase().includes(searchLower) ||
          item.products?.sku.toLowerCase().includes(searchLower)
        );
        
        if (!matchesReceipt && !matchesCustomer && !matchesProduct) return false;
      }
      
      return true;
    });

    setFilteredSales(filtered);
  }, [stableSales, debouncedFilters, debouncedSearchTerm]);

  // Calculate sales statistics
  const calculatedStats = useMemo((): SalesReportStats => {
    if (filteredSales.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalDiscounts: 0,
        totalTax: 0,
        averageOrderValue: 0,
        totalOrders: 0,
        uniqueCustomers: 0,
        topProducts: [],
        topCategories: [],
        paymentMethodBreakdown: [],
        dailyRevenue: []
      };
    }

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalDiscounts = filteredSales.reduce((sum, sale) => sum + sale.discount_amount, 0);
    const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax_amount, 0);
    const uniqueCustomers = new Set(filteredSales.map(sale => sale.customer_id).filter(Boolean)).size;

    // Top products
    const productStats: { [key: string]: { name: string; quantity: number; revenue: number; sku: string } } = {};
    filteredSales.forEach(sale => {
      sale.sale_items?.forEach((item: SalesReportSaleItem) => {
        const productId = item.product_id;
        if (!productStats[productId]) {
          productStats[productId] = {
            name: item.products?.name || 'Unknown',
            quantity: 0,
            revenue: 0,
            sku: item.products?.sku || 'N/A'
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.total_price;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top categories
    const categoryStats: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    filteredSales.forEach(sale => {
      sale.sale_items?.forEach((item: SalesReportSaleItem) => {
        const category = item.products?.categories?.name || 'Uncategorized';
        if (!categoryStats[category]) {
          categoryStats[category] = { name: category, quantity: 0, revenue: 0 };
        }
        categoryStats[category].quantity += item.quantity;
        categoryStats[category].revenue += item.total_price;
      });
    });

    const topCategories = Object.values(categoryStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Payment method breakdown
    const paymentStats: { [key: string]: { count: number; amount: number; cash_received: number; change_given: number } } = {};
    filteredSales.forEach(sale => {
      const method = sale.payment_method;
      if (!paymentStats[method]) {
        paymentStats[method] = { count: 0, amount: 0, cash_received: 0, change_given: 0 };
      }
      paymentStats[method].count += 1;
      paymentStats[method].amount += sale.total_amount;
      if (sale.cash_received) {
        paymentStats[method].cash_received += sale.cash_received;
      }
      if (sale.change_given) {
        paymentStats[method].change_given += sale.change_given;
      }
    });

    const paymentMethodBreakdown = Object.entries(paymentStats).map(([method, stats]) => ({
      method,
      count: stats.count,
      amount: stats.amount,
      cash_received: stats.cash_received,
      change_given: stats.change_given,
      percentage: (stats.count / filteredSales.length) * 100
    }));

    // Daily revenue
    const dailyStats: { [key: string]: { revenue: number; orders: number } } = {};
    filteredSales.forEach(sale => {
      const date = new Date(sale.transaction_date || sale.created_at).toDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { revenue: 0, orders: 0 };
      }
      dailyStats[date].revenue += sale.total_amount;
      dailyStats[date].orders += 1;
    });

    const dailyRevenue = Object.entries(dailyStats)
      .map(([date, stats]) => ({ 
        date, 
        ...stats,
        sales: stats.orders,
        customers: 0 // This would need to be calculated separately if needed
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalSales: filteredSales.length,
      totalRevenue,
      totalDiscounts,
      totalTax,
      averageOrderValue: totalRevenue / filteredSales.length,
      totalOrders: filteredSales.length,
      uniqueCustomers,
      topProducts,
      topCategories,
      paymentMethodBreakdown,
      dailyRevenue
    };
  }, [filteredSales]);


  // Export functions
  const exportToCSV = useCallback(() => {
    if (filteredSales.length === 0) {
      toast.error('No sales data to export');
      return;
    }

          // Log the export activity
      logActivity('data_export', 'Sales Report', `Exported sales report with ${filteredSales.length} sales`, {
        total_sales: filteredSales.length,
        date_range: `${startDate ? formatDate(new Date(startDate)) : 'N/A'} - ${endDate ? formatDate(new Date(endDate)) : 'N/A'}`
      });

    import('../utils/export-utils').then(({ exportSales }) => {
      try {
        exportSales(filteredSales as any, {
          storeName: currentStore?.name,
          businessName: currentBusiness?.name
        });
        
        toast.success('Sales report exported successfully');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export sales report');
      }
    }).catch(error => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [filteredSales, currentStore?.name, currentBusiness?.name, logActivity, startDate, endDate]);

  // Table columns for sales data
  const salesColumns = [
    {
      key: 'receipt',
      label: 'Receipt',
      render: (sale: SalesReportSale) => (
        <div className="font-mono text-sm font-medium">{sale.receipt_number}</div>
      )
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (sale: SalesReportSale) => (
        <div className="text-sm">
          <div className="font-medium">
            {formatDateTime(new Date(sale.transaction_date || sale.created_at))}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatTime(new Date(sale.transaction_date || sale.created_at))}
          </div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (sale: SalesReportSale) => (
        <div className="text-sm">
          <div className="font-medium">
            {sale.customer?.name || 'Walk-in Customer'}
          </div>
          {sale.customer?.phone && (
            <div className="text-xs text-muted-foreground">
              {sale.customer?.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'cashier',
      label: 'Cashier',
      render: (sale: SalesReportSale) => (
        <div className="text-sm">
          <div className="font-medium">
            {sale.cashier?.name || sale.cashier?.username || sale.users?.name || sale.users?.username || 'Unknown'}
          </div>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (sale: SalesReportSale) => (
        <div className="text-sm">
          <div className="font-medium">
            {sale.sale_items?.length || 0} items
          </div>
          <div className="text-xs text-muted-foreground">
            {sale.sale_items?.reduce((sum: number, item: SalesReportSaleItem) => sum + (item.quantity || 0), 0) || 0} total qty
          </div>
        </div>
      )
    },
    {
      key: 'amounts',
      label: 'Amounts',
      render: (sale: SalesReportSale) => (
        <div className="text-sm text-right">
          <div className="font-medium text-primary">
            {formatCurrency(sale.total_amount)}
          </div>
          {sale.discount_amount > 0 && (
            <div className="text-xs text-green-600">
              -{formatCurrency(sale.discount_amount)} discount
            </div>
          )}
          {sale.tax_amount > 0 && (
            <div className="text-xs text-muted-foreground">
              +{formatCurrency(sale.tax_amount)} tax
            </div>
          )}
        </div>
      )
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (sale: SalesReportSale) => (
        <div className="text-sm">
          <Badge variant={sale.payment_method === 'cash' ? 'default' : 'secondary'}>
            {sale.payment_method}
          </Badge>
          {sale.payment_method === 'cash' && sale.cash_received && (
            <>
              <div className="text-xs text-muted-foreground mt-1">
                Received: {formatCurrency(sale.cash_received)}
              </div>
              {sale.change_given && (
                <div className="text-xs text-muted-foreground">
                  Change: {formatCurrency(sale.change_given)}
                </div>
              )}
            </>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (sale: SalesReportSale) => (
        <Badge 
          variant={
            sale.status === 'completed' ? 'default' : 
            sale.status === 'pending' ? 'secondary' :
            sale.status === 'refunded' ? 'destructive' : 'outline'
          }
        >
          {sale.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (sale: SalesReportSale) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedSale(sale);
            setShowSaleModal(true);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sales report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={translate('sales.report') || 'Sales Report'}
        subtitle={translate('sales.analytics') || 'Comprehensive sales analytics and insights'}
        showBackButton
        onBack={onBack}
      >
        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          {translate('dashboard.refresh') || 'Refresh'}
        </Button>
      </Header>

      <div className="p-6">
        {/* Store/Business Indicator */}
        {user?.role === 'store_admin' && currentStore && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  Viewing sales data for: <span className="font-semibold">{currentStore.name}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {user?.role === 'business_admin' && currentBusiness && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  Viewing aggregated sales data for: <span className="font-semibold">{currentBusiness.name}</span>
                  {businessStores.length > 0 && (
                    <span className="text-sm text-green-700 ml-2">
                      ({businessStores.length} stores)
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Error Display */}
        {hasError && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">
                {user?.role === 'business_admin' 
                  ? (businessStoresError?.message || storeSalesError?.message || aggregatedSalesError?.message || 'Failed to load sales data')
                  : (storeSalesError?.message || 'Failed to load sales data')
                }
              </p>
            </CardContent>
          </Card>
        )}
        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              {translate('sales.filters') || 'Filters & Search'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>{translate('sales.dateRange') || 'Date Range'}</Label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(range) => {
                    if (range?.from && range?.to) {
                      setFilters(prev => ({ ...prev, dateRange: { from: range.from, to: range.to } }));
                    }
                  }}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>{translate('sales.paymentMethod') || 'Payment Method'}</Label>
                <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods.filter(Boolean).map((method: string) => (
                      <SelectItem key={`payment-${method}`} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>{translate('sales.status') || 'Status'}</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cashier */}
              <div className="space-y-2">
                <Label>{translate('sales.cashier') || 'Cashier'}</Label>
                <Select value={filters.cashier} onValueChange={(value) => setFilters(prev => ({ ...prev, cashier: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCashiers.filter(Boolean).map((cashier: string) => (
                      <SelectItem key={`cashier-${cashier}`} value={cashier}>
                        {cashier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search and Amount Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label>{translate('sales.search') || 'Search'}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Receipt, customer, product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{translate('sales.minAmount') || 'Min Amount'}</Label>
                <Input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>{translate('sales.maxAmount') || 'Max Amount'}</Label>
                <Input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: parseFloat(e.target.value) || 999999 }))}
                  placeholder="999999.00"
                />
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end mt-4">
              <div className="text-right">
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {translate('sales.exportCSV') || 'Export CSV'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Export includes: receipt details, customer info, payment breakdown, cash received, change given, and more
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {translate('sales.overview') || 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {translate('sales.analytics') || 'Analytics'}
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              {translate('sales.transactions') || 'Transactions'}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {translate('sales.insights') || 'Insights'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {translate('sales.totalRevenue') || 'Total Revenue'}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(calculatedStats.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {translate('sales.totalOrders') || 'Total Orders'}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {calculatedStats.totalOrders}
                      </p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {translate('sales.averageOrder') || 'Average Order'}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(calculatedStats.averageOrderValue)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {translate('sales.uniqueCustomers') || 'Unique Customers'}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {calculatedStats.uniqueCustomers}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products and Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {translate('sales.topProducts') || 'Top Products'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculatedStats.topProducts.slice(0, 5).map((product: any, index: number) => (
                      <div key={`product-${product.sku || index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-primary text-white text-xs font-bold rounded flex items-center justify-center">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{product.quantity} sold</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {translate('sales.topCategories') || 'Top Categories'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculatedStats.topCategories.slice(0, 5).map((category: any, index: number) => (
                      <div key={`category-${category.name || index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-secondary text-white text-xs font-bold rounded flex items-center justify-center">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{category.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{category.quantity} items</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(category.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Payment Method Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {translate('sales.paymentBreakdown') || 'Payment Method Breakdown'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {calculatedStats.paymentMethodBreakdown.map((method: any) => (
                    <div key={`payment-${method.method || 'unknown'}`} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {method.count}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {method.method}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {method.percentage.toFixed(1)}% of orders
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(method.amount)}
                      </div>
                      {method.method === 'cash' && method.cash_received && method.cash_received > 0 && (
                        <>
                          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                            <div>Cash Received:</div>
                            <div className="font-medium">{formatCurrency(method.cash_received)}</div>
                          </div>
                          {method.change_given && method.change_given > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <div>Change Given:</div>
                              <div className="font-medium">{formatCurrency(method.change_given)}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {translate('sales.dailyRevenue') || 'Daily Revenue Trend'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculatedStats.dailyRevenue.map((day: any) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDate(new Date(day.date))}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {formatCurrency(day.revenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {day.orders} orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  {translate('sales.transactions') || 'Sales Transactions'}
                  <Badge variant="secondary" className="ml-2">
                    {filteredSales.length} transactions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  title="Sales Transactions"
                  data={filteredSales}
                  columns={salesColumns}
                  tableName="products"
                  userRole={user?.role || 'user'}
                  searchable={true}
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  emptyMessage="No sales transactions found for the selected filters."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {translate('sales.performanceInsights') || 'Performance Insights'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Total Revenue</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculatedStats.totalRevenue)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Customer Reach</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {calculatedStats.uniqueCustomers} customers
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Average Order Value</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {formatCurrency(calculatedStats.averageOrderValue)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Management Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {translate('sales.cashManagement') || 'Cash Management'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calculatedStats.paymentMethodBreakdown.find((m: any) => m.method === 'cash') && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Cash Transactions</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {calculatedStats.paymentMethodBreakdown.find((m: any) => m.method === 'cash')?.count || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Cash Received</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(calculatedStats.paymentMethodBreakdown.find((m: any) => m.method === 'cash')?.cash_received || 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">Change Given</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">
                          {formatCurrency(calculatedStats.paymentMethodBreakdown.find((m: any) => m.method === 'cash')?.change_given || 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Net Cash</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">
                          {formatCurrency(
                            (calculatedStats.paymentMethodBreakdown.find((m: any) => m.method === 'cash')?.cash_received || 0) - 
                            (calculatedStats.paymentMethodBreakdown.find((m: any) => m.method === 'cash')?.change_given || 0)
                          )}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {!calculatedStats.paymentMethodBreakdown.find((m: any) => m.method === 'cash') && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No cash transactions in this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {translate('sales.summaryStats') || 'Summary Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {calculatedStats.totalDiscounts > 0 ? 
                        ((calculatedStats.totalDiscounts / calculatedStats.totalRevenue) * 100).toFixed(1) : '0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Discount Rate</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(calculatedStats.totalDiscounts)} total
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {calculatedStats.totalTax > 0 ? 
                        ((calculatedStats.totalTax / calculatedStats.totalRevenue) * 100).toFixed(1) : '0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Tax Rate</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(calculatedStats.totalTax)} total
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {calculatedStats.totalOrders > 0 ? 
                        (calculatedStats.totalRevenue / calculatedStats.totalOrders).toFixed(2) : '0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {calculatedStats.totalOrders} orders
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {calculatedStats.uniqueCustomers > 0 ? 
                        ((calculatedStats.uniqueCustomers / calculatedStats.totalOrders) * 100).toFixed(1) : '0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Repeat Customer Rate</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {calculatedStats.uniqueCustomers} unique customers
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sale Details Modal */}
      {showSaleModal && selectedSale && (
        <Dialog open={showSaleModal} onOpenChange={setShowSaleModal}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Sale Details - {selectedSale.receipt_number}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Sale Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sale Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Receipt Number:</span>
                      <span className="font-mono">{selectedSale.receipt_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date & Time:</span>
                      <span>{formatDateTime(new Date(selectedSale.transaction_date || selectedSale.created_at))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant={
                        selectedSale.status === 'completed' ? 'default' : 
                        selectedSale.status === 'pending' ? 'secondary' :
                        selectedSale.status === 'refunded' ? 'destructive' : 'outline'
                      }>
                        {selectedSale.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Method:</span>
                      <Badge variant={selectedSale.payment_method === 'cash' ? 'default' : 'secondary'}>
                        {selectedSale.payment_method}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{selectedSale.customer?.name || selectedSale.customers?.name || 'Walk-in Customer'}</span>
                    </div>
                    {(selectedSale.customer?.phone || selectedSale.customers?.phone) && (
                      <div className="flex justify-between">
                        <span className="font-medium">Phone:</span>
                        <span>{selectedSale.customer?.phone || selectedSale.customers?.phone}</span>
                      </div>
                    )}
                    {(selectedSale.customer?.email || selectedSale.customers?.email) && (
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{selectedSale.customer?.email || selectedSale.customers?.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Cashier:</span>
                      <span>{selectedSale.cashier?.name || selectedSale.cashier?.username || selectedSale.users?.name || selectedSale.users?.username || 'Unknown'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sale Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedSale.sale_items?.map((item: SalesReportSaleItem, index: number) => (
                      <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-primary text-white text-xs font-bold rounded flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.products?.name || 'Unknown Product'}</p>
                            <p className="text-xs text-muted-foreground">SKU: {item.products?.sku || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                          <p className="text-sm text-primary font-bold">
                            {formatCurrency(item.total_price)}
                          </p>
                          {item.discount_amount > 0 && (
                            <p className="text-xs text-green-600">
                              -{formatCurrency(item.discount_amount)} discount
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedSale.subtotal)}</span>
                    </div>
                    {selectedSale.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="text-green-600">-{formatCurrency(selectedSale.discount_amount)}</span>
                      </div>
                    )}
                    {selectedSale.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedSale.tax_amount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(selectedSale.total_amount)}</span>
                    </div>
                    
                    {/* Cash Transaction Details */}
                    {selectedSale.payment_method === 'cash' && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Cash Received:</span>
                            <span>{formatCurrency(selectedSale.cash_received || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Change Given:</span>
                            <span>{formatCurrency(selectedSale.change_given || 0)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowSaleModal(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
