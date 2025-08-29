'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/common/Header';
import { DataTable } from '@/components/common/DataTable';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { Sale, SalesStats, ActivityLog } from '@/types/dashboard';
import { calculateSalesStats, formatCurrency, formatDateTime, formatTableDateTime } from '@/utils/dashboardUtils';
import { 
  ShoppingCart, 
  BarChart3, 
  TrendingUp,
  Clock,
  User,
  History,
  Receipt,
  Search,
  Eye,
  DollarSign,
  Plus,
  Package,
  Activity,
  RefreshCw
} from 'lucide-react';

// Custom hooks moved outside component to prevent recreation on every render
const useCashierSales = (cashierId: string, storeId: string) => {
  const [data, setData] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!cashierId || !storeId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching cashier sales for:', { cashierId, storeId });
      const response = await fetch(`/api/sales?store_id=${storeId}&cashier_id=${cashierId}&status=completed`);
      if (!response.ok) throw new Error('Failed to fetch cashier sales');
      const result = await response.json();
      
      if (result.success && Array.isArray(result.sales)) {
        console.log('Cashier sales data:', result.sales);
        setData(result.sales);
      } else {
        console.warn('Invalid cashier sales response:', result);
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching cashier sales:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cashierId, storeId]);

  return { data, isLoading, error, refetch: fetchData };
};

const useStoreSales = (storeId: string) => {
  const [data, setData] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching store sales for:', { storeId });
      const response = await fetch(`/api/sales?store_id=${storeId}&status=completed`);
      if (!response.ok) throw new Error('Failed to fetch store sales');
      const result = await response.json();
      
      if (result.success && Array.isArray(result.sales)) {
        console.log('Store sales data:', result.sales);
        setData(result.sales);
      } else {
        console.warn('Invalid store sales response:', result);
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching store sales:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  return { data, isLoading, error, refetch: fetchData };
};

const useActivityLogs = (userId: string) => {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentBusiness } = useAuth();

  const fetchData = async () => {
    if (!userId || !currentBusiness?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching activity logs for:', { userId, businessId: currentBusiness.id });
      const response = await fetch(`/api/activity-logs?business_id=${currentBusiness.id}&user_id=${userId}&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch activity logs');
      const result = await response.json();
      
      if (result.success && Array.isArray(result.logs)) {
        console.log('Activity logs data:', result.logs);
        setData(result.logs);
      } else {
        console.warn('Invalid activity logs response:', result);
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, currentBusiness?.id]);

  return { data, isLoading, error, refetch: fetchData };
};

export const CashierDashboard: React.FC = () => {
  const { user, logout, currentStore } = useAuth();
  const router = useRouter();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Debug logging


  // Data fetching hooks
  const {
    data: cashierSales = [],
    isLoading: isLoadingCashierSales,
    error: cashierSalesError,
    refetch: refetchCashierSales
  } = useCashierSales(
    user?.id || '', 
    currentStore?.id || ''
  );

  const {
    data: storeSales = [],
    isLoading: isLoadingStoreSales,
    error: storeSalesError,
    refetch: refetchStoreSales
  } = useStoreSales(currentStore?.id || '');

  const {
    data: activityLogs = [],
    isLoading: isLoadingActivity,
    error: activityLogsError,
    refetch: refetchActivityLogs
  } = useActivityLogs(user?.id || '');

  // Ensure activityLogs is always an array
  const safeActivityLogs = useMemo(() => {
    return Array.isArray(activityLogs) ? activityLogs : [];
  }, [activityLogs]);

  // Determine which sales data to use based on user role
  const salesData = useMemo(() => {
    let data: Sale[] = [];
    
    if (user?.role === 'cashier') {
      data = Array.isArray(cashierSales) ? cashierSales : [];
    } else if (user?.role === 'store_admin') {
      // Store admins can only see their store's sales
      console.log('Store sales data:', storeSales);
      data = Array.isArray(storeSales) ? storeSales.filter((sale: Sale) => sale.storeId === currentStore?.id) : [];
    } else if (user?.role === 'business_admin') {
      // Business admins can see all store sales
      data = Array.isArray(storeSales) ? storeSales : [];
    } else {
      data = Array.isArray(storeSales) ? storeSales : []; // Default fallback
    }
    
    console.log('Sales data for dashboard:', { 
      userRole: user?.role, 
      cashierSalesCount: cashierSales.length, 
      storeSalesCount: storeSales.length, 
      finalDataCount: data.length,
      cashierSales: cashierSales.slice(0, 2), // Show first 2 items for debugging
      storeSales: storeSales.slice(0, 2) // Show first 2 items for debugging
    });
    
    return data;
  }, [user?.role, cashierSales, storeSales, currentStore?.id]);

  // Combined loading state
  const isLoading = isLoadingCashierSales || isLoadingStoreSales || isLoadingActivity;

  // Combined error state
  const hasError = cashierSalesError || storeSalesError || activityLogsError;

  // Refresh function
  const handleRefresh = useCallback(async () => {
    try {
      console.log('Refreshing dashboard data...');
      await Promise.all([
        refetchCashierSales(),
        refetchStoreSales(),
        refetchActivityLogs()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [refetchCashierSales, refetchStoreSales, refetchActivityLogs]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate sales statistics
  const overviewStats = calculateSalesStats(salesData, '', 'today');
  const salesStats = calculateSalesStats(salesData, searchTerm, dateFilter);

  // Filtered sales data for the sales tab
  const filteredSalesData = useMemo(() => {
    // Ensure salesData is an array
    if (!Array.isArray(salesData)) {
      console.warn('salesData is not an array:', salesData);
      return [];
    }
    
    if (!searchTerm.trim() && dateFilter === 'all') {
      return salesData;
    }

    return salesData.filter(sale => {
      // Date filtering
      const saleDate = new Date(sale.timestamp || sale.transaction_date || sale.created_at || new Date());
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateMatch = true;
      switch (dateFilter) {
        case 'today':
          dateMatch = saleDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          dateMatch = saleDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateMatch = saleDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateMatch = saleDate >= monthAgo;
          break;
        case 'all':
        default:
          dateMatch = true;
      }

      if (!dateMatch) return false;

      // Search filtering
      if (!searchTerm.trim()) return true;

      const searchLower = searchTerm.toLowerCase();
      
      // Search in sale ID
      if (sale.id.toLowerCase().includes(searchLower)) return true;
      
      // Search in customer name (check both possible property names)
      if (sale.customerName?.toLowerCase().includes(searchLower) ||
          sale.customers?.name?.toLowerCase().includes(searchLower)) return true;
      
      // Search in customer phone (check both possible property names)
      if (sale.customerPhone?.includes(searchTerm) ||
          sale.customers?.phone?.includes(searchTerm)) return true;
      
      // Search in sale items and product names
      if (sale.sale_items?.some((item: { products?: { name?: string }; product?: { name?: string } }) => 
        item.products?.name?.toLowerCase().includes(searchLower) ||
        item.product?.name?.toLowerCase().includes(searchLower)
      )) return true;
      
      // Search in payment method
      if ((sale.payment_method || sale.paymentMethod)?.toLowerCase().includes(searchLower)) return true;
      
      // Search in receipt number
      if (sale.receipt_number?.toLowerCase().includes(searchLower)) return true;

      return false;
    });
  }, [salesData, searchTerm, dateFilter]);

  // Handle sale click to show details
  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetail(true);
  };

  // Handle reprint receipt
  const handleReprintReceipt = async () => {
    if (selectedSale) {
      try {
        // For now, just log the action since printReceipt is not implemented
        console.log('Reprinting receipt for sale:', selectedSale.id);
        
        // Close the modal
        setShowSaleDetail(false);
        setSelectedSale(null);
      } catch (error) {
        console.error('Error reprinting receipt:', error);
      }
    }
  };

  // Sales columns for DataTable
  const salesColumns = [
    {
      key: 'id',
      label: 'Sale ID',
      render: (sale: Sale) => (
        <div className="font-medium">
          #{sale.id.slice(-6)}
        </div>
      )
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (sale: Sale) => (
        <div className="text-sm">
          <div className="font-medium">{formatTableDateTime(sale.timestamp || sale.transaction_date || sale.created_at || new Date())}</div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (sale: Sale) => (
        <div className="text-sm">
          {(sale.customerName || sale.customers?.name) && (sale.customerName || sale.customers?.name) !== 'Walk-in Customer' ? (
            <div>
              <p className="font-medium">{sale.customerName || sale.customers?.name}</p>
              {(sale.customerPhone || sale.customers?.phone) && (
                <p className="text-muted-foreground text-xs">{sale.customerPhone || sale.customers?.phone}</p>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Walk-in Customer</span>
          )}
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (sale: Sale) => (
        <div className="text-sm">
          <p className="font-medium">{sale.sale_items?.length || 0} items</p>
          <p className="text-muted-foreground text-xs">
            {sale.sale_items?.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0) || 0} total qty
          </p>
        </div>
      )
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (sale: Sale) => (
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {(sale.payment_method || sale.paymentMethod) === 'cash' ? 'Cash' : 'Card'}
            </Badge>
          </div>
          {(sale.payment_method || sale.paymentMethod) === 'cash' && sale.cash_received && (
            <div className="text-xs text-muted-foreground">
              Received: {formatCurrency(sale.cash_received)}
            </div>
          )}
          {(sale.payment_method || sale.paymentMethod) === 'cash' && sale.change_given && (
            <div className="text-xs text-muted-foreground">
              Change: {formatCurrency(sale.change_given)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total',
      render: (sale: Sale) => (
        <div className="text-right">
          <p className="font-semibold text-green-600">
            {formatCurrency(Number(sale.total_amount || sale.total || 0))}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (sale: Sale) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSaleClick(sale)}
          className="w-full"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      )
    }
  ];

  // Activity log columns for DataTable
  const activityColumns = [
    {
      key: 'timestamp',
      label: 'Time',
      render: (log: ActivityLog) => (
        <div className="text-sm w-32 flex-shrink-0">
          <div className="font-medium">{formatTableDateTime(log.timestamp || log.created_at || new Date())}</div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: ActivityLog) => (
        <div className="w-24 flex-shrink-0">
          <Badge 
            variant={(log.action || log.activity_type) === 'sale_create' ? 'default' : 'secondary'}
            className="capitalize text-xs"
          >
            {(log.action || log.activity_type)?.replace(/_/g, ' ') || 'Unknown'}
          </Badge>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (log: ActivityLog) => (
        <div className="min-w-0 flex-1 pr-6 max-w-48">
          <p className="text-sm font-medium break-words leading-relaxed">{log.description}</p>
          {(log.module || log.category) && (
            <p className="text-xs text-muted-foreground mt-1">{log.module || log.category}</p>
          )}
        </div>
      )
    },
    {
      key: 'metadata',
      label: 'Details',
      render: (log: ActivityLog) => (
        <div className="text-sm text-muted-foreground min-w-0 flex-shrink-0 w-36">
          {log.metadata && Object.keys(log.metadata).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(log.metadata).map(([key, value]) => (
                <div key={key} className="text-xs break-words">
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">No additional details</span>
          )}
        </div>
      )
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout(() => router.push('/auth/login'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Cashier Dashboard"
        subtitle={`Welcome back, ${user?.name || user?.username}`}
      >
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push('/pos')} 
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Open POS
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {hasError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800 text-sm">
                  {hasError.message || 'Failed to load dashboard data'}
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Today&apos;s Sales</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(overviewStats.totalSales)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {overviewStats.transactionCount} transactions
                        </p>
                      </div>
                      <DollarSign className="w-10 h-10 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Sale</p>
                        <p className="text-3xl font-bold text-purple-600">{formatCurrency(overviewStats.averageTransaction)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Per transaction
                        </p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Methods</p>
                        <p className="text-3xl font-bold text-blue-600">{overviewStats.cashTransactions + overviewStats.cardTransactions}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {overviewStats.cashTransactions} cash, {overviewStats.cardTransactions} card
                        </p>
                      </div>
                      <Receipt className="w-10 h-10 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Access POS Card */}
              <Card className="border-brand-primary/20 bg-brand-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-primary mb-2">Ready to Start a Sale?</h3>
                      <p className="text-sm text-muted-foreground">
                        Open the Point of Sale system to process transactions, manage inventory, and serve customers.
                      </p>
                    </div>
                    <Button 
                      onClick={() => router.push('/pos')} 
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 text-lg font-medium"
                      size="lg"
                    >
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      Open POS
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sales">Sales History</TabsTrigger>
                  <TabsTrigger value="activity">Activity Log</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Recent Sales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Recent Sales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {salesData.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No sales recorded yet</p>
                          <p className="text-sm mt-2">Start making sales to see your activity here</p>
                          <Button 
                            className="mt-4" 
                            onClick={() => router.push('/pos')}
                          >
                            Start First Sale
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {salesData.slice(0, 5).map(sale => (
                            <div 
                              key={sale.id} 
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group" 
                              onClick={() => handleSaleClick(sale)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                                  <Receipt className="w-6 h-6 text-brand-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">Sale #{sale.id.slice(-6)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDateTime(sale.timestamp || sale.transaction_date || sale.created_at || new Date())}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-brand-primary">{formatCurrency(Number(sale.total_amount || sale.total || 0))}</p>
                                <Badge variant="outline" className="mt-1">
                                  {(sale.payment_method || sale.paymentMethod) === 'cash' ? 'Cash' : 'Card'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {salesData.length > 5 && (
                            <div className="text-center pt-4">
                              <Button variant="outline" onClick={() => setActiveTab('sales')}>
                                View All Sales ({salesData.length})
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sales" className="space-y-6">
                  {/* Sales Search and Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {user?.role === 'cashier' ? 'My Sales History' : 'Store Sales History'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search sales by ID, customer name, phone, or product names..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {searchTerm.trim() && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Found {filteredSalesData.length} sales matching &quot;{searchTerm}&quot;
                            </p>
                          )}
                        </div>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Date Filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Refresh
                        </Button>
                      </div>
                      
                      <DataTable
                        title="Sales History"
                        data={filteredSalesData}
                        columns={salesColumns}
                        searchable={false}
                        emptyMessage={searchTerm.trim() ? `No sales found matching &quot;${searchTerm}&quot;` : "No sales found"}
                        tableName="sales"
                        userRole={user?.role}
                        pagination={{
                          enabled: true,
                          pageSize: 20,
                          showPageSizeSelector: true,
                          showPageInfo: true
                        }}
                        height={600}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  {/* Activity Log */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        My Activity Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        title="Activity Log"
                        data={safeActivityLogs}
                        columns={activityColumns}
                        searchable={true}
                        searchPlaceholder="Search activities..."
                        emptyMessage="No activity recorded yet"
                        tableName="activityLogs"
                        userRole={user?.role}
                        pagination={{
                          enabled: true,
                          pageSize: 20,
                          showPageSizeSelector: true,
                          showPageInfo: true
                        }}
                        height={500}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      {/* Sale Detail Modal */}
      <Dialog open={showSaleDetail} onOpenChange={setShowSaleDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Sale #{selectedSale.id.slice(-6)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(selectedSale.timestamp || selectedSale.transaction_date || selectedSale.created_at || new Date())}
                  </p>
                </div>
                <Badge variant="outline">
                  {(selectedSale.payment_method || selectedSale.paymentMethod) === 'cash' ? 'Cash' : 'Card'}
                </Badge>
              </div>

              {/* Customer Info */}
              {(selectedSale.customerName || selectedSale.customers?.name) && (selectedSale.customerName || selectedSale.customers?.name) !== 'Walk-in Customer' && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedSale.customerName || selectedSale.customers?.name}</p>
                    </div>
                    {(selectedSale.customerPhone || selectedSale.customers?.phone) && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{selectedSale.customerPhone || selectedSale.customers?.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              {selectedSale.sale_items && selectedSale.sale_items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Items Sold</h4>
                  <div className="space-y-2">
                    {selectedSale.sale_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.products?.image_url ? (
                            <ImageWithFallback
                              src={item.products.image_url}
                              alt={item.products.name || 'Product'}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.products?.name || 'Unknown Product'}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                          {item.discount_amount && item.discount_amount > 0 && (
                            <p className="text-xs text-green-600">-{formatCurrency(item.discount_amount)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSale.subtotal || 0)}</span>
                </div>
                {(Number(selectedSale.tax_amount || selectedSale.tax || 0)) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(Number(selectedSale.tax_amount || selectedSale.tax || 0))}</span>
                  </div>
                )}
                {(selectedSale.discount_amount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-green-600">-{formatCurrency(selectedSale.discount_amount || 0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(Number(selectedSale.total_amount || selectedSale.total || 0))}</span>
                </div>
                {(selectedSale.payment_method || selectedSale.paymentMethod) === 'cash' && (selectedSale.cash_received || selectedSale.cashAmount) && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Cash Received:</span>
                      <span>{formatCurrency(Number(selectedSale.cash_received || selectedSale.cashAmount || 0))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change Given:</span>
                      <span>{formatCurrency(Number(selectedSale.change_given || selectedSale.change || 0))}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  onClick={handleReprintReceipt}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Reprint Receipt
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaleDetail(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
