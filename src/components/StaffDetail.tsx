/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import { Header } from './common/Header';
import { DataTable } from './common/DataTable';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useStoreSales } from '../utils/hooks/useStoreData';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Download,
  Search,
  Clock,
  Users,
  Receipt,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface StaffDetailProps {
  onBack: () => void;
  staffMember: {
    id: string;
    name: string;
    username: string;
    email: string;
    phone?: string;
    store_id?: string;
    storeName?: string;
    is_active: boolean;
    role: 'business_admin' | 'store_admin' | 'cashier';
    permissions?: string[];
    created_at: string;
    last_login?: string;
    totalSales?: number;
    transactionCount?: number;
  } | null;
}

interface StaffSale {
  id: string;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  transaction_date: string;
  created_at: string;
  customer_id?: string;
  customer_name?: string;
  items_count: number;
}

const ROLE_OPTIONS = [
  { value: 'business_admin', label: 'Business Admin', color: 'bg-red-500' },
  { value: 'store_admin', label: 'Store Admin', color: 'bg-blue-500' },
  { value: 'cashier', label: 'Cashier', color: 'bg-green-500' }
];

export const StaffDetail: React.FC<StaffDetailProps> = ({ onBack, staffMember }) => {
  const { currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();
  
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [salesDateFilter, setSalesDateFilter] = useState('all');
  const [salesStatusFilter, setSalesStatusFilter] = useState('all');
  const [salesPaymentFilter, setSalesPaymentFilter] = useState('all');

  const {
    data: staffSales,
    isLoading,
    isError,
    refetch,
    error
  } = useStoreSales(staffMember?.store_id || '', {
    enabled: !!staffMember?.store_id && !!staffMember.store_id
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Filter staff sales
  const filteredStaffSales = useMemo(() => {
    if (!staffSales) return [];

    return staffSales.filter((sale: any) => {
      const matchesSearch = sale.receipt_number.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
                           (sale.customer_name && sale.customer_name.toLowerCase().includes(salesSearchTerm.toLowerCase()));
      
      const matchesDate = salesDateFilter === 'all' || 
                         (salesDateFilter === 'today' && new Date(sale.transaction_date).toDateString() === new Date().toDateString()) ||
                         (salesDateFilter === 'week' && new Date(sale.transaction_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (salesDateFilter === 'month' && new Date(sale.transaction_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      
      const matchesStatus = salesStatusFilter === 'all' || sale.status === salesStatusFilter;
      const matchesPayment = salesPaymentFilter === 'all' || sale.payment_method === salesPaymentFilter;
      
      return matchesSearch && matchesDate && matchesStatus && matchesPayment;
    });
  }, [staffSales, salesSearchTerm, salesDateFilter, salesStatusFilter, salesPaymentFilter]);

  // Sales statistics
  const totalSalesAmount = useMemo(() => 
    filteredStaffSales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0), 
    [filteredStaffSales]
  );
  
  const totalTransactions = useMemo(() => filteredStaffSales.length, [filteredStaffSales]);
  
  const avgTransactionValue = useMemo(() => 
    totalTransactions > 0 ? totalSalesAmount / totalTransactions : 0, 
    [totalTransactions, totalSalesAmount]
  );

  const exportStaffSales = useCallback(() => {
    if (!staffMember || filteredStaffSales.length === 0) {
      toast.error('No sales data to export');
      return;
    }

    import('../utils/export-utils').then(({ exportStaffSales: exportStaffSalesUtil }) => {
      try {
        exportStaffSalesUtil(filteredStaffSales, staffMember.name, {
          storeName: currentStore?.name,
          businessName: currentBusiness?.name
        });
        
        toast.success('Sales data exported successfully');
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export sales data');
      }
    }).catch(error => {
      console.error('Failed to load export utilities:', error);
      toast.error('Export functionality not available');
    });
  }, [staffMember, filteredStaffSales, currentStore?.name, currentBusiness?.name]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const roleOption = ROLE_OPTIONS.find(r => r.value === role);
    return roleOption?.color || 'bg-gray-500';
  };

  if (!staffMember) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">No Staff Member Selected</p>
          <p className="text-muted-foreground mb-4">Please select a staff member to view details</p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }



  // DataTable columns configuration for sales
  const salesColumns = [
    {
      key: 'receipt',
      header: 'Receipt',
      render: (sale: StaffSale) => (
        <div className="font-medium">{sale.receipt_number}</div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (sale: StaffSale) => (
        <div>{new Date(sale.transaction_date).toLocaleDateString()}</div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (sale: StaffSale) => (
        <div>{sale.customer_name}</div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (sale: StaffSale) => (
        <div className="font-medium">{formatCurrency(sale.total_amount)}</div>
      )
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (sale: StaffSale) => (
        <Badge variant="outline">{sale.payment_method}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (sale: StaffSale) => (
        <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
          {sale.status}
        </Badge>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (sale: StaffSale) => (
        <div>{sale.items_count}</div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={`Staff Details: ${staffMember.name}`}
        subtitle={`Store: ${staffMember.storeName || 'Not assigned'}`}
        showBackButton
        onBack={onBack}
        showLogout={false}
      >
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {!staffMember.store_id && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <p className="text-amber-800 text-sm">This staff member is not currently assigned to a store. Sales data will not be available.</p>
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error?.message || 'Failed to load sales data'}</p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Staff Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{getInitials(staffMember.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-2xl font-bold">{staffMember.name}</div>
                <div className="text-sm text-muted-foreground">
                  {ROLE_OPTIONS.find(r => r.value === staffMember.role)?.label} • {staffMember.email}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Username:</strong> @{staffMember.username}</p>
                  <p><strong>Phone:</strong> {staffMember.phone || 'Not provided'}</p>
                  <p><strong>Store:</strong> {staffMember.storeName || 'Not assigned'}</p>
                  <p><strong>Status:</strong> 
                    <Badge variant={staffMember.is_active ? "default" : "secondary"} className="ml-2">
                      {staffMember.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Total Sales:</strong> {formatCurrency(staffMember.totalSales || 0)}</p>
                  <p><strong>Transactions:</strong> {staffMember.transactionCount || 0}</p>
                  <p><strong>Created:</strong> {new Date(staffMember.created_at).toLocaleDateString()}</p>
                  {staffMember.last_login && (
                    <p><strong>Last Login:</strong> {new Date(staffMember.last_login).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-1">
                  {(staffMember.permissions || ['pos']).map(permission => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-semibold">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatCurrency(totalSalesAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-semibold">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : totalTransactions}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-semibold">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : formatCurrency(avgTransactionValue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by receipt or customer..."
                  value={salesSearchTerm}
                  onChange={(e) => setSalesSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={salesDateFilter} onValueChange={setSalesDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={salesStatusFilter} onValueChange={setSalesStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={salesPaymentFilter} onValueChange={setSalesPaymentFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportStaffSales} disabled={filteredStaffSales.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground ml-2">Loading sales data...</p>
              </div>
            ) : (
              <DataTable
                title=""
                data={filteredStaffSales}
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
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{isLoading ? 'Loading sales data...' : 'No sales found'}</p>
                  </div>
                }
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
