import React, { useMemo, useState, useCallback } from 'react';
import { Header } from './common/Header';
import { useSystem } from '../contexts/SystemContext';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from './common/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Loader2, Search, Download, Clock, ListChecks } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  useCashierSales, 
  useCashierActivity, 
  useExportCashierData 
} from '@/stores/cashier';
import { 
  CashierDetailProps, 
  CashierSale, 
  CashierActivityLog, 
  CashierFilters 
} from '@/types/cashier';

export const CashierDetail: React.FC<CashierDetailProps> = ({ onBack, cashier }) => {
  const { formatCurrency } = useSystem();
  const { currentBusiness } = useAuth();

  // Filters
  const [filters, setFilters] = useState<CashierFilters>({
    search: '',
    dateFilter: 'all',
    paymentFilter: 'all',
    activitySearch: '',
    activityType: 'all'
  });

  // React Query hooks
  const {
    data: sales = [],
    isLoading: isLoadingSales,
    error: salesError
  } = useCashierSales(
    cashier?.id || '', 
    cashier?.store_id || '', 
    { enabled: !!cashier?.id && !!cashier?.store_id }
  );

  const {
    data: activity = [],
    isLoading: isLoadingActivity,
    error: activityError
  } = useCashierActivity(
    cashier?.id || '', 
    currentBusiness?.id || '', 
    cashier?.store_id || '', 
    { enabled: !!cashier?.id && !!currentBusiness?.id && !!cashier?.store_id }
  );

  const exportCashierDataMutation = useExportCashierData();

  const isLoading = isLoadingSales || isLoadingActivity;

  // Handle errors
  if (salesError) {
    toast.error('Failed to load sales data');
  }
  if (activityError) {
    toast.error('Failed to load activity data');
  }

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const q = filters.search.toLowerCase();
      const matchesSearch = s.receipt_number.toLowerCase().includes(q) || (s.customer_name || '').toLowerCase().includes(q);
      const now = new Date();
      const date = new Date(s.transaction_date);
      const matchesDate =
        filters.dateFilter === 'all' ||
        (filters.dateFilter === 'today' && date.toDateString() === now.toDateString()) ||
        (filters.dateFilter === 'week' && date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (filters.dateFilter === 'month' && date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      const matchesPayment = filters.paymentFilter === 'all' || s.payment_method === filters.paymentFilter;
      return matchesSearch && matchesDate && matchesPayment;
    });
  }, [sales, filters.search, filters.dateFilter, filters.paymentFilter]);

  const filteredActivity = useMemo(() => {
    const q = filters.activitySearch.toLowerCase();
    return (activity || []).filter((log: CashierActivityLog) => {
      const matchesText = (
        (log.description || '').toLowerCase().includes(q) ||
        (log.module || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q)
      );
      const matchesType = filters.activityType === 'all' || log.action === filters.activityType;
      return matchesText && matchesType;
    });
  }, [activity, filters.activitySearch, filters.activityType]);

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalTransactions = filteredSales.length;
  const avgTransaction = totalTransactions ? totalSalesAmount / totalTransactions : 0;

  const exportSales = useCallback(() => {
    if (!filteredSales.length) {
      toast.error('No sales to export');
      return;
    }
    if (!cashier?.id) {
      toast.error('Cashier information not available');
      return;
    }
    
    exportCashierDataMutation.mutate({
      cashierId: cashier.id,
      storeId: cashier.store_id,
      format: 'csv'
    });
  }, [filteredSales, cashier, exportCashierDataMutation]);

  if (!cashier) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cashier details...</p>
        </div>
      </div>
    );
  }

  // DataTable columns configuration for sales
  const salesColumns = [
    {
      key: 'receipt',
      header: 'Receipt',
      render: (sale: CashierSale) => (
        <div className="font-medium">{sale.receipt_number}</div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (sale: CashierSale) => (
        <div>{new Date(sale.transaction_date).toLocaleDateString()}</div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (sale: CashierSale) => (
        <div>{sale.customer_name}</div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (sale: CashierSale) => (
        <div className="font-medium">{formatCurrency(sale.total_amount)}</div>
      )
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (sale: CashierSale) => (
        <Badge variant="outline">{sale.payment_method}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (sale: CashierSale) => (
        <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
          {sale.status}
        </Badge>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (sale: CashierSale) => (
        <div>{sale.items_count}</div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={`Cashier: ${cashier.name}`}
        subtitle={`Store: ${cashier.storeName || 'Not assigned'}`}
        showBackButton
        onBack={onBack}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Total Sales</p>
              <p className="text-2xl font-semibold">{formatCurrency(totalSalesAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Transactions</p>
              <p className="text-2xl font-semibold">{totalTransactions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm">Avg Transaction</p>
              <p className="text-2xl font-semibold">{formatCurrency(avgTransaction)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Search receipt or customer..." 
                  value={filters.search} 
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} 
                />
              </div>
              <Select value={filters.dateFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, dateFilter: value as 'all' | 'today' | 'week' | 'month' }))}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Date" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.paymentFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentFilter: value as 'all' | 'cash' | 'card' | 'mobile' }))}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Payment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportSales}><Download className="w-4 h-4 mr-2" />Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title=""
              data={filteredSales}
              columns={salesColumns}
              searchable={false}
              pagination={{
                enabled: true,
                pageSize: 15,
                showPageSizeSelector: false,
                showPageInfo: true
              }}
              emptyMessage={
                <div className="text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No sales found</p>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log ({filteredActivity.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Search activity..." 
                  value={filters.activitySearch} 
                  onChange={(e) => setFilters(prev => ({ ...prev, activitySearch: e.target.value }))} 
                />
              </div>
              <Select value={filters.activityType} onValueChange={(value) => setFilters(prev => ({ ...prev, activityType: value as 'all' | 'login' | 'create' | 'update' | 'delete' }))}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="h-[360px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((log: CashierActivityLog) => {
                    // Ensure timestamp is a Date object with error handling
                    let timestamp: Date;
                    try {
                      timestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
                      if (isNaN(timestamp.getTime())) {
                        console.warn('Invalid timestamp:', log.timestamp);
                        timestamp = new Date(); // Fallback to current date
                      }
                    } catch (error) {
                      console.error('Error parsing timestamp:', log.timestamp, error);
                      timestamp = new Date(); // Fallback to current date
                    }
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm">{timestamp.toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{timestamp.toLocaleTimeString()}</p>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{log.action}</Badge></TableCell>
                        <TableCell>{log.module}</TableCell>
                        <TableCell className="max-w-[480px]"><span className="truncate block">{log.description}</span></TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredActivity.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No activity found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
