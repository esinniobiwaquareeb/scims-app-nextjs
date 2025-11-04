/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { DashboardLayout } from './common/DashboardLayout';
import { useSystem } from '../contexts/SystemContext';
import { DataTable } from './common/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Loader2, Search, Building2, Store, Users, CreditCard, Globe, MapPin, Phone, Mail, Globe2, Calendar, Activity, TrendingUp, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  BUSINESS_TYPE_LABELS, 
  BUSINESS_TYPE_DESCRIPTIONS,
  BUSINESS_TYPE_ICONS
} from './common/BusinessTypeConstants';

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  business_type?: string;
  country_id?: string;
  currency_id?: string;
  language_id?: string;
  timezone: string;
  subscription_plan_id?: string;
  subscription_status: string;
  is_active: boolean;
  country?: {
    id: string;
    name: string;
    code: string;
  };
  currency?: {
    id: string;
    name: string;
    symbol: string;
  };
  language?: {
    id: string;
    name: string;
    code: string;
  };
  subscription_plans?: {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    max_stores: number;
    max_products: number;
    max_users: number;
  };
  stores: Array<{
    id: string;
    name: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    manager_name?: string;
    is_active: boolean;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface BusinessDetailProps {
  business: Business | null;
}

export const BusinessDetail: React.FC<BusinessDetailProps> = ({ business }) => {
  const { formatCurrency } = useSystem();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [salesSearch, setSalesSearch] = useState('');
  const [salesDateFilter, setSalesDateFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      if (!business) return;

      try {
        setIsLoading(true);

        const [productsResponse, usersResponse, activityResponse, salesResponse] = await Promise.all([
          fetch(`/api/products?business_id=${business.id}`),
          fetch(`/api/staff?business_id=${business.id}`),
          fetch(`/api/activity-logs?business_id=${business.id}`),
          fetch(`/api/sales?business_id=${business.id}`)
        ]);

        const productsData = productsResponse.ok ? (await productsResponse.json()).products || [] : [];
        const usersData = usersResponse.ok ? (await usersResponse.json()).staff || [] : [];
        const activityLogs = activityResponse.ok ? (await activityResponse.json()).logs || [] : [];
        const salesData = salesResponse.ok ? (await salesResponse.json()).sales || [] : [];

        setProducts(productsData || []);
        setUsers(usersData || []);
        setActivity(activityLogs || []);
        setSales(salesData || []);
      } catch (e: any) {
        console.error(e);
        toast.error('Failed to load business details');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [business]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = productSearch.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        (product.sku || '').toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q)
      );
    });
  }, [products, productSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = userSearch.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        (user.username || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q)
      );
    });
  }, [users, userSearch]);

  const filteredActivity = useMemo(() => {
    const q = activitySearch.toLowerCase();
    return (activity || []).filter((log: any) => {
      const matchesText = (
        (log.description || '').toLowerCase().includes(q) ||
        (log.category || '').toLowerCase().includes(q) ||
        (log.activity_type || '').toLowerCase().includes(q)
      );
      const matchesType = activityType === 'all' || log.activity_type === activityType;
      return matchesText && matchesType;
    });
  }, [activity, activitySearch, activityType]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const q = salesSearch.toLowerCase();
      const matchesSearch = (
        sale.receipt_number.toLowerCase().includes(q) ||
        (sale.customer_name || '').toLowerCase().includes(q)
      );
      
      const now = new Date();
      const date = new Date(sale.transaction_date);
      const matchesDate =
        salesDateFilter === 'all' ||
        (salesDateFilter === 'today' && date.toDateString() === now.toDateString()) ||
        (salesDateFilter === 'week' && date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (salesDateFilter === 'month' && date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesDate;
    });
  }, [sales, salesSearch, salesDateFilter]);

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    totalStores: business?.stores?.length || 0,
    activeStores: business?.stores?.filter(s => s.is_active).length || 0,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
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
    
    // Export business overview
    const businessData = {
      business: {
        name: business.name,
        email: business.email,
        phone: business.phone,
        address: business.address,
        website: business.website,
        description: business.description,
        business_type: business.business_type,
        timezone: business.timezone,
        subscription_status: business.subscription_status,
        subscription_plan: business.subscription_plans?.name,
        country: business.country?.name,
        currency: business.currency?.name,
        language: business.language?.name,
        created_at: business.created_at,
        updated_at: business.updated_at
      },
      stores: business.stores,
      products: products,
      users: users,
      sales: sales
    };

    const dataStr = JSON.stringify(businessData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.name.replace(/\s+/g, '_')}_business_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Business data exported');
  }, [business, products, users, sales]);

  if (!business) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Loading business details..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading business details...</p>
          </div>
        </div>
      </DashboardLayout>
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
      key: 'discount',
      header: 'Discount',
      render: (sale: any) => (
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
    <DashboardLayout
      title={business.name}
      subtitle={`${BUSINESS_TYPE_LABELS[business.business_type as keyof typeof BUSINESS_TYPE_LABELS] || 'Business'} • ${business.subscription_status} subscription`}
    >
      <div className="space-y-6">
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
                  <Badge variant={getSubscriptionColor(business.subscription_plans?.name || 'Unknown', business.subscription_status)}>
                    {business.subscription_plans?.name || 'Unknown'}
                  </Badge>
                  {getStatusIcon(business.subscription_status)}
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
                  value={productSearch} 
                  onChange={(e) => setProductSearch(e.target.value)} 
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
                  value={userSearch} 
                  onChange={(e) => setUserSearch(e.target.value)} 
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
                  value={salesSearch} 
                  onChange={(e) => setSalesSearch(e.target.value)} 
                />
              </div>
              <Select value={salesDateFilter} onValueChange={setSalesDateFilter}>
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
                  value={activitySearch} 
                  onChange={(e) => setActivitySearch(e.target.value)} 
                />
              </div>
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
                          <p className="text-sm">{new Date(log.timestamp).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.module}</TableCell>
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
      </div>
    </DashboardLayout>
  );
};
