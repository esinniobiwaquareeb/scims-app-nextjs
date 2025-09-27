/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, useCallback } from 'react';
import { Header } from './common/Header';
import { useSystem } from '../contexts/SystemContext';
// useAuth removed as it's not used
import { DataTable } from './common/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
// toast is now handled by the store hooks
import { Loader2, Search, Download, Building2, Store, Users, CreditCard, Globe, MapPin, Phone, Mail, Globe2, Calendar, Activity, TrendingUp, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  BUSINESS_TYPE_LABELS, 
  BUSINESS_TYPE_DESCRIPTIONS,
  BUSINESS_TYPE_ICONS
} from './common/BusinessTypeConstants';
import { BusinessDetailProps, BusinessStats, BusinessFilters } from '@/types';
import { useBusinessDetailData, useExportBusinessData } from '@/stores';

// Business and BusinessDetailProps are now imported from types

export const BusinessDetail: React.FC<BusinessDetailProps> = ({ onBack, business }) => {
  const { formatCurrency } = useSystem();

  // Filters
  const [filters, setFilters] = useState<BusinessFilters>({
    productSearch: '',
    userSearch: '',
    activitySearch: '',
    activityType: 'all',
    salesSearch: '',
    salesDateFilter: 'all'
  });

  // Use the new business detail data hook
  const {
    data: businessData,
    isLoading
  } = useBusinessDetailData(business?.id || '', {
    enabled: !!business?.id
  });

  // Export business data hook
  const exportBusinessDataMutation = useExportBusinessData();

  // Extract data from the hook
  const products = useMemo(() => businessData?.products || [], [businessData?.products]);
  const users = useMemo(() => businessData?.users || [], [businessData?.users]);
  const activity = useMemo(() => businessData?.activity || [], [businessData?.activity]);
  const sales = useMemo(() => businessData?.sales || [], [businessData?.sales]);

  // Filter update functions
  const updateFilter = (key: keyof BusinessFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const q = filters.productSearch.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        (product.sku || '').toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q)
      );
    });
  }, [products, filters.productSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => {
      const q = filters.userSearch.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        (user.username || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q)
      );
    });
  }, [users, filters.userSearch]);

  const filteredActivity = useMemo(() => {
    const q = filters.activitySearch.toLowerCase();
    return (activity || []).filter((log: any) => {
      const matchesText = (
        (log.description || '').toLowerCase().includes(q) ||
        (log.category || '').toLowerCase().includes(q) ||
        (log.activity_type || '').toLowerCase().includes(q)
      );
      const matchesType = filters.activityType === 'all' || log.activity_type === filters.activityType;
      return matchesText && matchesType;
    });
  }, [activity, filters.activitySearch, filters.activityType]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale: any) => {
      const q = filters.salesSearch.toLowerCase();
      const matchesSearch = (
        sale.receipt_number.toLowerCase().includes(q) ||
        (sale.customer_name || '').toLowerCase().includes(q)
      );
      
      const now = new Date();
      const date = new Date(sale.transaction_date);
      const matchesDate =
        filters.salesDateFilter === 'all' ||
        (filters.salesDateFilter === 'today' && date.toDateString() === now.toDateString()) ||
        (filters.salesDateFilter === 'week' && date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (filters.salesDateFilter === 'month' && date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesDate;
    });
  }, [sales, filters.salesSearch, filters.salesDateFilter]);

  // Calculate stats
  const stats: BusinessStats = {
    totalProducts: products.length,
    activeProducts: products.filter((p: any) => p.is_active).length,
    totalUsers: users.length,
    activeUsers: users.filter((u: any) => u.is_active).length,
    totalStores: business?.stores?.length || 0,
    activeStores: business?.stores?.filter((s: any) => s.is_active).length || 0,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum: number, sale: any) => sum + (sale.total_amount || 0), 0),
    recentActivity: activity.length,
    subscriptionStatus: business?.subscription_status as 'active' | 'expired' | 'cancelled' | 'suspended' || 'active'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSubscriptionColor = (subscription: string, status: string) => {
    if (status === 'expired' || status === 'cancelled') return 'destructive';
    switch (subscription) {
      case 'Starter': return 'secondary';
      case 'Professional': return 'default';
      case 'Enterprise': return 'default';
      default: return 'secondary';
    }
  };

  const exportBusinessData = useCallback(() => {
    if (!business) return;
    
    exportBusinessDataMutation.mutate({
      businessId: business.id,
      includeProducts: true,
      includeUsers: true,
      includeActivity: true,
      includeSales: true,
      format: 'csv'
    });
  }, [business, exportBusinessDataMutation]);

  if (!business) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  // DataTable columns configuration for products
  const productColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (product: any) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-muted-foreground">{product.sku}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (product: any) => (
        <div>{product.category?.name || 'N/A'}</div>
      )
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (product: any) => (
        <div>{product.brand?.name || 'N/A'}</div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (product: any) => (
        <div className="font-medium">{formatCurrency(product.price)}</div>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: any) => (
        <div>
          <span className={product.stock_quantity <= (product.min_stock_level || 0) ? 'text-red-600 font-medium' : ''}>
            {product.stock_quantity}
          </span>
          {product.min_stock_level && (
            <span className="text-sm text-muted-foreground ml-1">
              (min: {product.min_stock_level})
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: any) => (
        <Badge variant={product.is_active ? 'default' : 'secondary'}>
          {product.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  // DataTable columns configuration for users
  const userColumns = [
    {
      key: 'name',
      header: 'User',
      render: (user: any) => (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.username}</div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: any) => (
        <div>{user.email || 'N/A'}</div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: any) => (
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
      )
    },
    {
      key: 'store',
      header: 'Store',
      render: (user: any) => (
        <div>{user.store?.name || 'Not assigned'}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: any) => (
        <Badge variant={user.is_active ? 'default' : 'secondary'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  // DataTable columns configuration for sales
  const salesColumns = [
    {
      key: 'receipt',
      header: 'Receipt',
      render: (sale: any) => (
        <div className="font-medium">{sale.receipt_number}</div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (sale: any) => (
        <div>{new Date(sale.transaction_date).toLocaleDateString()}</div>
      )
    },
    {
      key: 'store',
      header: 'Store',
      render: (sale: any) => (
        <div>{sale.store?.name || 'N/A'}</div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (sale: any) => (
        <div>{sale.customer?.name || 'Walk-in'}</div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (sale: any) => (
        <div className="font-medium">{formatCurrency(sale.total_amount)}</div>
      )
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (sale: any) => (
        <Badge variant="outline">{sale.payment_method}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (sale: any) => (
        <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
          {sale.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={business.name}
        subtitle={`${BUSINESS_TYPE_LABELS[business.business_type as keyof typeof BUSINESS_TYPE_LABELS] || 'Business'} • ${business.subscription_status} subscription`}
        showBackButton
        onBack={onBack}
      >
        <Button onClick={exportBusinessData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Business Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
                <p className="font-medium">{business.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                <p className="font-medium">{business.phone || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe2 className="w-4 h-4" />
                  Website
                </div>
                <p className="font-medium">
                  {business.website ? (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {business.website}
                    </a>
                  ) : 'N/A'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Address
                </div>
                <p className="font-medium">{business.address || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="w-4 h-4" />
                  Business Type
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{BUSINESS_TYPE_ICONS[business.business_type as keyof typeof BUSINESS_TYPE_ICONS] || '🏢'}</span>
                  <Badge variant="outline" className="font-medium">
                    {BUSINESS_TYPE_LABELS[business.business_type as keyof typeof BUSINESS_TYPE_LABELS] || 'Retail Store'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {BUSINESS_TYPE_DESCRIPTIONS[business.business_type as keyof typeof BUSINESS_TYPE_DESCRIPTIONS] || 'Traditional retail with inventory management'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  Country
                </div>
                <p className="font-medium">{business.country?.name || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  Currency
                </div>
                <p className="font-medium">{business.currency?.name || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe2 className="w-4 h-4" />
                  Language
                </div>
                <p className="font-medium">{business.language?.name || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Timezone
                </div>
                <p className="font-medium">{business.timezone}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  Subscription
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getSubscriptionColor(business.subscription_plans?.name || 'Unknown', business.subscription_status || 'active')}>
                    {business.subscription_plans?.name || 'Unknown'}
                  </Badge>
                  {getStatusIcon(business.subscription_status || 'active')}
                </div>
              </div>
            </div>

            {/* Description */}
            {business.description && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Description</div>
                <p className="text-sm">{business.description}</p>
              </div>
            )}

            {/* Subscription Details */}
            {business.subscription_plans && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.subscription_plans.max_stores}</div>
                  <div className="text-sm text-muted-foreground">Max Stores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.subscription_plans.max_products}</div>
                  <div className="text-sm text-muted-foreground">Max Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.subscription_plans.max_users}</div>
                  <div className="text-sm text-muted-foreground">Max Users</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stores</p>
                  <p className="text-2xl font-semibold">{stats.totalStores}</p>
                  <p className="text-xs text-muted-foreground">{stats.activeStores} active</p>
                </div>
                <Store className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-semibold">{stats.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">{stats.activeProducts} active</p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-semibold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">{stats.activeUsers} active</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">{stats.totalSales} transactions</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Stores ({stats.totalStores})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {business.stores?.map(store => (
                <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{store.name}</h4>
                      <Badge variant={store.is_active ? 'default' : 'secondary'}>
                        {store.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {store.address && <p>{store.address}</p>}
                      {store.city && store.state && (
                        <p>{store.city}, {store.state} {store.postal_code}</p>
                      )}
                      {store.phone && <p>{store.phone}</p>}
                      {store.email && <p>{store.email}</p>}
                      {store.manager_name && <p>Manager: {store.manager_name}</p>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(store.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {!business.stores?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No stores found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Products ({stats.totalProducts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Search products..." 
                  value={filters.productSearch} 
                  onChange={(e) => updateFilter('productSearch', e.target.value)} 
                />
              </div>
            </div>
            <DataTable
              title=""
              data={filteredProducts}
              columns={productColumns}
              searchable={false}
              pagination={{
                enabled: true,
                pageSize: 10,
                showPageSizeSelector: false,
                showPageInfo: true
              }}
              emptyMessage={
                <div className="text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No products found</p>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({stats.totalUsers})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Search users..." 
                  value={filters.userSearch} 
                  onChange={(e) => updateFilter('userSearch', e.target.value)} 
                />
              </div>
            </div>
            <DataTable
              title=""
              data={filteredUsers}
              columns={userColumns}
              searchable={false}
              pagination={{
                enabled: true,
                pageSize: 10,
                showPageSizeSelector: false,
                showPageInfo: true
              }}
              emptyMessage={
                <div className="text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sales Transactions ({stats.totalSales})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Search sales..." 
                  value={filters.salesSearch} 
                  onChange={(e) => updateFilter('salesSearch', e.target.value)} 
                />
              </div>
              <Select value={filters.salesDateFilter} onValueChange={(value) => updateFilter('salesDateFilter', value)}>
                <SelectTrigger className="w-36">
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
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No sales found</p>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log ({filteredActivity.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Search activity..." 
                  value={filters.activitySearch} 
                  onChange={(e) => updateFilter('activitySearch', e.target.value)} 
                />
              </div>
              <Select value={filters.activityType} onValueChange={(value) => updateFilter('activityType', value)}>
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
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm">{new Date(log.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{log.activity_type}</Badge>
                      </TableCell>
                      <TableCell>{log.category}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="truncate block">{log.description}</span>
                      </TableCell>
                      <TableCell>{log.user?.name || 'System'}</TableCell>
                    </TableRow>
                  ))}
                  {!filteredActivity.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
