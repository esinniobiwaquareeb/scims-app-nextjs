/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Header } from './common/Header';
import { useSystem } from '../contexts/SystemContext';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from './common/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Loader2, Download, Clock } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface CashierSale {
  id: string;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  transaction_date: string;
  customer_name?: string;
  items_count: number;
  discount_amount?: number;
  applied_coupon_id?: string;
  applied_promotion_id?: string;
  discount_reason?: string;
  applied_coupon?: {
    id: string;
    code: string;
    name: string;
    discount_type: {
      name: string;
    };
    discount_value: number;
  };
  applied_promotion?: {
    id: string;
    name: string;
    discount_type: {
      name: string;
    };
    discount_value: number;
  };
}

interface ActivityLog {
  id: string;
  description: string;
  action: string;
  module: string;
  timestamp: Date | string;
  userName: string;
  userRole: string;
  metadata?: Record<string, any>;
}

interface CashierDetailProps {
  onBack: () => void;
  cashier: {
    id: string;
    name: string;
    username: string;
    email?: string;
    store_id?: string;
    storeName?: string;
  } | null;
}

export const CashierDetail: React.FC<CashierDetailProps> = ({ onBack, cashier }) => {
  const { formatCurrency } = useSystem();
  const { currentBusiness } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<CashierSale[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  // Filters
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [activityType, setActivityType] = useState('all');

  useEffect(() => {
    const load = async () => {
      if (!cashier) return;
      if (!cashier.store_id) {
        toast.error('Cashier is not assigned to a store');
        return;
      }

      try {
        setIsLoading(true);

        // Check if we have the required parameters
        if (!currentBusiness?.id) {
          console.error('No business ID available for activity logs');
          toast.error('Business context not available');
          return;
        }

        const [salesResponse, activityResponse] = await Promise.all([
          fetch(`/api/sales?cashier_id=${cashier.id}&store_id=${cashier.store_id}`),
          fetch(`/api/activity-logs?user_id=${cashier.id}&business_id=${currentBusiness.id}&store_id=${cashier.store_id}`)
        ]);

        const salesData = salesResponse.ok ? (await salesResponse.json()).sales || [] : [];
        const activityData = activityResponse.ok ? (await activityResponse.json()).logs || [] : [];
        
        
        
        if (!activityResponse.ok) {
          console.error('Activity logs API error:', activityResponse.status, await activityResponse.text());
        }

        const mappedSales = salesData.map((s: any) => ({
          id: s.id,
          receipt_number: s.receipt_number,
          total_amount: Number(s.total_amount || 0),
          payment_method: s.payment_method,
          status: s.status,
          transaction_date: s.transaction_date,
          customer_name: s.customers?.name || 'Walk-in',
          items_count: s.sale_items?.length || 0
        }));

        setSales(mappedSales);
        setActivity(activityData);
        
        if (activityData.length === 0) {
  
        }
      } catch (e: unknown) {
        console.error(e);
        toast.error('Failed to load cashier details');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [cashier, currentBusiness?.id]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const now = new Date();
      const date = new Date(s.transaction_date);
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && date.toDateString() === now.toDateString()) ||
        (dateFilter === 'week' && date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === 'month' && date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      const matchesPayment = paymentFilter === 'all' || s.payment_method === paymentFilter;
      return matchesDate && matchesPayment;
    });
  }, [sales, dateFilter, paymentFilter]);

  const filteredActivity = useMemo(() => {
    return (activity || []).filter((log: ActivityLog) => {
      const matchesType = activityType === 'all' || log.action === activityType;
      return matchesType;
    });
  }, [activity, activityType]);

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalTransactions = filteredSales.length;
  const avgTransaction = totalTransactions ? totalSalesAmount / totalTransactions : 0;

  const exportSales = useCallback(() => {
    if (!filteredSales.length) {
      toast.error('No sales to export');
      return;
    }
    const headers = ['Receipt', 'Date', 'Customer', 'Amount', 'Payment', 'Status', 'Items'];
    const rows = filteredSales.map((s) => [
      s.receipt_number,
      new Date(s.transaction_date).toLocaleString(),
      s.customer_name,
      s.total_amount,
      s.payment_method,
      s.status,
      s.items_count
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cashier?.name || 'cashier'}_sales.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Sales exported');
  }, [filteredSales, cashier?.name]);

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
      key: 'discount',
      header: 'Discount',
      render: (sale: CashierSale) => (
        <div className="text-sm text-right">
          {sale.discount_amount && sale.discount_amount > 0 ? (
            <div>
              <div className="font-medium text-green-600">
                -{formatCurrency(sale.discount_amount)}
              </div>
              {(sale.applied_coupon?.code || sale.applied_promotion?.name) && (
                <div className="text-xs text-muted-foreground">
                  {sale.applied_coupon?.code || sale.applied_promotion?.name}
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </div>
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
    <div className="h-full flex flex-col">
      <Header 
        title={`Cashier: ${cashier.name}`}
        subtitle={`Store: ${cashier.storeName || 'Not assigned'}`}
        showBackButton
        onBack={onBack}
        showLogout={false}
        simplified
      />

      <main className="flex-1 overflow-y-auto pt-[73px] sm:pt-[81px] lg:pt-[89px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-semibold">{formatCurrency(totalSalesAmount)}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">₦</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-semibold">{totalTransactions}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">#</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-semibold">{formatCurrency(avgTransaction)}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-medium">Ø</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Date:</span>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Payment:</span>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="ml-auto">
                <Button variant="outline" onClick={exportSales}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales DataTable */}
        <DataTable
          title="Sales Transactions"
          data={filteredSales}
          columns={salesColumns}
          searchable={true}
          searchPlaceholder="Search receipt or customer..."
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

        {/* Activity Log */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Log ({filteredActivity.length})</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Type:</span>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                  {filteredActivity.map((log: ActivityLog) => {
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
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
        </div>
      </main>
    </div>
  );
};
