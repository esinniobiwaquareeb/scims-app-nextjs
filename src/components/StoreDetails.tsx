/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import { useTheme } from '../contexts/ThemeContext';
// import { useActivityLogger } from '../contexts/ActivityLogger';
import { toast } from 'sonner';
import { Header } from './common/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Store as StoreIcon, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  
  AlertTriangle
} from 'lucide-react';
import { 
  useStoreSettings
} from '../utils/hooks/stores';
import { useStoreSales } from '../utils/hooks/sales';
import { useStoreCustomers } from '../utils/hooks/customers';
import { useStoreProducts } from '../utils/hooks/products';
import { StoreSettings } from './StoreSettings';


interface StoreDetailsProps {
  onBack: () => void;
  store: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    website?: string;
    manager_name?: string;
    is_active?: boolean;
  } | null;
}

export const StoreDetails: React.FC<StoreDetailsProps> = ({ onBack, store }) => {
  const { formatCurrency, getCurrentCurrency } = useSystem();
  const { user, currentStore: authCurrentStore } = useAuth();
  const { isDark } = useTheme();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  // Use the store ID from the store prop
  const storeId = store?.id;
  const storeName = store?.name;

  // Check if user is store admin and if they have access to this store
  const isStoreAdmin = user?.role === 'store_admin';
  const currentStore = authCurrentStore;
  const hasAccessToStore = isStoreAdmin ? currentStore?.id === storeId : true;

  // Fetch store data - hooks must be called before any conditional returns
  const {
    data: storeSettings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useStoreSettings(storeId || '', { 
    enabled: !!storeId 
  });

  // Store dashboard stats will be calculated from other data
  // const dashboardStats = null;
  // const isLoadingStats = false;
  // const statsError = null;

  // Fetch store products
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError
  } = useStoreProducts(storeId || '', { 
    enabled: !!storeId 
  });

  // Fetch store sales
  const {
    data: sales,
    isLoading: isLoadingSales,
    error: salesError
  } = useStoreSales(storeId || '', { 
    enabled: !!storeId 
  });

  // Fetch store customers
  const {
    data: customers,
    isLoading: isLoadingCustomers,
    error: customersError
  } = useStoreCustomers(storeId || '', { 
    enabled: !!storeId 
  });

  // Handle errors
  useEffect(() => {
    const errors = [settingsError, productsError, salesError, customersError].filter(Boolean);
    if (errors.length > 0) {
      const errorMessage = errors[0]?.message || 'Failed to load store data';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [settingsError, productsError, salesError, customersError]);

  // If store admin doesn't have access to this store, show access denied
  if (isStoreAdmin && !hasAccessToStore) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Access Denied" onBack={onBack} showLogout={false} simplified />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to view this store. You can only access your assigned store.
            </p>
            <Button onClick={onBack}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={`Store: ${storeName || 'Loading...'}`} onBack={onBack} showLogout={false} simplified />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p>Loading store details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading store data</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
    );
  }

  // Store not found
  if (!storeSettings) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Store Not Found" onBack={onBack} showLogout={false} simplified />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Store not found</p>
            <Button onClick={onBack}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use store data from settings as primary, then from props as fallback
  const storeData = storeSettings || store;
  // const stats = dashboardStats || {};
  const storeProducts = products || [];
  const storeSales = sales || [];
  const storeCustomers = customers || [];
  
  // Calculate stats from available data
  const todaySales = storeSales.filter((sale: { transaction_date: any; created_at: any; total_amount?: number; }) => {
    const saleDate = new Date(sale.transaction_date || sale.created_at);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  
  const calculatedStats = {
    totalProducts: storeProducts.length,
    todaysSalesRevenue: todaySales.reduce((sum: number, sale: { total_amount?: number }) => {
      return sum + (Number(sale.total_amount) || 0);
    }, 0),
    todaysSalesCount: todaySales.length,
    totalSalesRevenue: storeSales.reduce((sum: number, sale: { total_amount?: number }) => {
      return sum + (Number(sale.total_amount) || 0);
    }, 0),
    totalSalesCount: storeSales.length,
    totalCustomers: storeCustomers.length,
    ordersToday: todaySales.length
  };

  // Use calculated stats
  const typedStats = calculatedStats;

  return (
    <div className="h-full flex flex-col">
      <Header 
        title={`Store: ${storeData?.name || store?.name || 'Loading...'}`}
        subtitle={storeData?.address || store?.address ? 
          `${storeData?.address || store?.address}, ${storeData?.city || store?.city || ''}, ${storeData?.state || store?.state || ''}` : 
          'Address not available'}
        showBackButton
        onBack={onBack}
        showLogout={false}
        simplified
      />
      
      <main className="flex-1 overflow-y-auto pt-[73px] sm:pt-[81px] lg:pt-[89px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Store Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="p-4 bg-primary rounded-xl shadow-sm">
                <StoreIcon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {storeData?.name || store?.name}
                  </h1>
                  <Badge variant={storeData?.is_active !== false ? "default" : "secondary"}>
                    {storeData?.is_active !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {storeData?.address || storeData?.city || storeData?.state ? (
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    {storeData?.address && `${storeData.address}`}
                    {(storeData?.city || storeData?.state) && (
                      <span>
                        {storeData?.address && ', '}
                        {storeData?.city && `${storeData.city}`}
                        {storeData?.city && storeData?.state && ', '}
                        {storeData?.state && `${storeData.state}`}
                      </span>
                    )}
                    {storeData?.postal_code && ` ${storeData.postal_code}`}
                  </p>
                ) : null}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              {storeData?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <a href={`tel:${storeData.phone}`} className="hover:text-primary transition-colors">
                    {storeData.phone}
                  </a>
                </div>
              )}
              {storeData?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <a href={`mailto:${storeData.email}`} className="hover:text-primary transition-colors break-all">
                    {storeData.email}
                  </a>
                </div>
              )}
              {storeData?.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <a 
                    href={storeData.website.startsWith('http') ? storeData.website : `https://${storeData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors break-all"
                  >
                    {storeData.website}
                  </a>
                </div>
              )}
              {storeData?.manager_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Manager: {storeData.manager_name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{typedStats.totalProducts}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Today&apos;s Sales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(typedStats.todaysSalesRevenue)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{typedStats.todaysSalesCount} {typedStats.todaysSalesCount === 1 ? 'transaction' : 'transactions'}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{typedStats.totalCustomers}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Orders Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{typedStats.ordersToday}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm py-2">Products</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs sm:text-sm py-2">Sales</TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm py-2">Customers</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm py-2">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Information */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5" />
                    Store Information
                  </CardTitle>
                  <CardDescription>
                    Basic store details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{storeData?.name || store?.name}</p>
                    </div>
                    {storeData?.address && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{storeData.address}</p>
                      </div>
                    )}
                    {(storeData?.city || storeData?.state || storeData?.postal_code) && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {storeData?.city && `${storeData.city}`}
                          {storeData?.city && storeData?.state && ', '}
                          {storeData?.state && `${storeData.state}`}
                          {storeData?.postal_code && ` ${storeData.postal_code}`}
                        </p>
                      </div>
                    )}
                    {storeData?.phone && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                        <a href={`tel:${storeData.phone}`} className="text-sm text-primary hover:underline">
                          {storeData.phone}
                        </a>
                      </div>
                    )}
                    {storeData?.email && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                        <a href={`mailto:${storeData.email}`} className="text-sm text-primary hover:underline break-all">
                          {storeData.email}
                        </a>
                      </div>
                    )}
                    {storeData?.website && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Website</p>
                        <a 
                          href={storeData.website.startsWith('http') ? storeData.website : `https://${storeData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {storeData.website}
                        </a>
                      </div>
                    )}
                    {storeData?.manager_name && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Manager</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{storeData.manager_name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Business Settings & Statistics */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5" />
                    Statistics & Settings
                  </CardTitle>
                  <CardDescription>
                    Store performance metrics and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Performance</p>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Sales Revenue:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(typedStats.totalSalesRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{typedStats.totalSalesCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Configuration</p>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Currency:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{getCurrentCurrency()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Language:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{storeData?.language || 'English'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tax Rate:</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{storeData?.taxRate || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tax Enabled:</span>
                          <Badge variant={storeData?.enableTax ? "default" : "secondary"} className="text-xs">
                            {storeData?.enableTax ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Returns Allowed:</span>
                          <Badge variant={storeData?.allowReturns ? "default" : "secondary"} className="text-xs">
                            {storeData?.allowReturns ? "Yes" : "No"}
                          </Badge>
                        </div>
                        {storeData?.allowReturns && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Return Period:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{storeData?.returnPeriodDays || 30} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="w-5 h-5" />
                      Store Products
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {storeProducts.length} {storeProducts.length === 1 ? 'product' : 'products'} available in this store
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {storeProducts.length} {storeProducts.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
                  </div>
                ) : storeProducts.length > 0 ? (
                  <div className="space-y-3">
                    {storeProducts.slice(0, 10).map((product: any) => (
                      <div key={product.id} className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow ${
                        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {product.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                SKU: {product.sku || 'N/A'}
                              </p>
                              <span className={`text-xs ${
                                isDark ? 'text-gray-500' : 'text-gray-400'
                              }`}>•</span>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Stock: {product.stock_quantity || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatCurrency(product.price || 0)}
                            </p>
                            <Badge 
                              variant={product.stock_quantity > 0 ? "default" : "secondary"} 
                              className="mt-1 text-xs"
                            >
                              {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {storeProducts.length > 10 && (
                      <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
                        <p className={`text-sm mb-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Showing 10 of {storeProducts.length} products
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/products'}>
                          View All Products
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      No Products Found
                    </h3>
                    <p className={`mb-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      This store doesn&apos;t have any products yet.
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = '/products'}>
                      Add Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShoppingCart className="w-5 h-5" />
                      Recent Sales
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Recent sales transactions for this store
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {storeSales.length} {storeSales.length === 1 ? 'sale' : 'sales'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading sales...</p>
                  </div>
                ) : storeSales.length > 0 ? (
                  <div className="space-y-3">
                    {storeSales.slice(0, 10).map((sale: any) => (
                      <div key={sale.id} className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow ${
                        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              Sale #{sale.receipt_number || sale.id.slice(-8).toUpperCase()}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {new Date(sale.transaction_date || sale.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <span className={`text-xs ${
                                isDark ? 'text-gray-500' : 'text-gray-400'
                              }`}>•</span>
                              <p className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {sale.items?.length || 0} {sale.items?.length === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className={`font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatCurrency(sale.total_amount || 0)}
                            </p>
                            <Badge variant="default" className="mt-1 text-xs">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {storeSales.length > 10 && (
                      <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
                        <p className={`text-sm mb-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Showing 10 of {storeSales.length} sales
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/sales-report'}>
                          View All Sales
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      No Sales Found
                    </h3>
                    <p className={`${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No sales transactions found for this store yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5" />
                      Store Customers
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Customers who have made purchases at this store
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {storeCustomers.length} {storeCustomers.length === 1 ? 'customer' : 'customers'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingCustomers ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
                  </div>
                ) : storeCustomers.length > 0 ? (
                  <div className="space-y-3">
                    {storeCustomers.slice(0, 10).map((customer: any) => (
                      <div key={customer.id} className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow ${
                        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {customer.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {customer.phone && (
                                <>
                                  <p className={`text-xs ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {customer.phone}
                                  </p>
                                  {customer.email && (
                                    <span className={`text-xs ${
                                      isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`}>•</span>
                                  )}
                                </>
                              )}
                              {customer.email && (
                                <p className={`text-xs truncate ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {customer.email}
                                </p>
                              )}
                              {!customer.phone && !customer.email && (
                                <p className={`text-xs ${
                                  isDark ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  No contact information
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {customer.total_purchases || 0} {customer.total_purchases === 1 ? 'purchase' : 'purchases'}
                            </p>
                            <Badge variant="default" className="mt-1 text-xs">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {storeCustomers.length > 10 && (
                      <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
                        <p className={`text-sm mb-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Showing 10 of {storeCustomers.length} customers
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/customers'}>
                          View All Customers
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      No Customers Found
                    </h3>
                    <p className={`${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No customers have made purchases at this store yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Only show if user has access */}
          {hasAccessToStore && (
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5" />
                    Store Settings
                  </CardTitle>
                  <CardDescription>
                    Configure store preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className={`font-semibold mb-3 text-sm ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            Receipt Settings
                          </h4>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Header</p>
                              <p className={`text-sm ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {storeData.receiptHeader || storeData.receipt_header || 'Not set'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Footer</p>
                              <p className={`text-sm ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {storeData.receiptFooter || storeData.receipt_footer || 'Not set'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Custom Message</p>
                              <p className={`text-sm ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {storeData.customReceiptMessage || storeData.custom_receipt_message || 'Not set'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className={`font-semibold mb-3 text-sm ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            Theme Settings
                          </h4>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Primary Color</p>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                  style={{ backgroundColor: storeData.theme?.primaryColor || storeData.primary_color || '#3B82F6' }}
                                ></div>
                                <span className={`text-sm font-mono ${
                                  isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {storeData.theme?.primaryColor || storeData.primary_color || '#3B82F6'}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Secondary Color</p>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                  style={{ backgroundColor: storeData.theme?.secondaryColor || storeData.secondary_color || '#10B981' }}
                                ></div>
                                <span className={`text-sm font-mono ${
                                  isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {storeData.theme?.secondaryColor || storeData.secondary_color || '#10B981'}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Accent Color</p>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                  style={{ backgroundColor: storeData.theme?.accentColor || storeData.accent_color || '#F59E0B' }}
                                ></div>
                                <span className={`text-sm font-mono ${
                                  isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {storeData.theme?.accentColor || storeData.accent_color || '#F59E0B'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>


        {/* Store Settings Component - Only show if user has access */}
        {store && hasAccessToStore && (
          <StoreSettings 
            storeId={storeId || ''} 
            store={store}
            storeSettings={storeSettings}
            onSave={async (settings: Record<string, unknown>) => {
              try {
                // Separate store data from store settings data
                const storeData = {
                  name: settings.name as string,
                  address: settings.address as string,
                  city: settings.city as string,
                  state: settings.state as string,
                  postal_code: settings.postal_code as string,
                  phone: settings.phone as string,
                  email: settings.email as string,
                  manager_name: settings.manager_name as string,
                  country_id: settings.country_id as string || null,
                  currency_id: settings.currency_id as string || null,
                  language_id: settings.language_id as string || null,
                  is_active: settings.is_active as boolean
                };

                const storeSettingsData = {
                  primary_color: settings.primary_color as string,
                  secondary_color: settings.secondary_color as string,
                  accent_color: settings.accent_color as string,
                  logo_url: settings.logo_url as string,
                  receipt_header: settings.receipt_header as string,
                  receipt_footer: settings.receipt_footer as string,
                  return_policy: settings.return_policy as string,
                  contact_person: settings.contact_person as string,
                  store_hours: settings.store_hours as string,
                  store_promotion_info: settings.store_promotion_info as string,
                  custom_receipt_message: settings.custom_receipt_message as string,
                  allow_returns: settings.allow_returns as boolean,
                  return_period_days: settings.return_period_days as number,
                  enable_tax: settings.enable_tax as boolean,
                  tax_rate: settings.tax_rate as number,
                  enable_sounds: settings.enable_sounds as boolean
                };

                // Update store
                const storeResponse = await fetch(`/api/stores/${storeId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(storeData),
                });

                if (!storeResponse.ok) {
                  throw new Error('Failed to update store');
                }

                // Update store settings
                const settingsResponse = await fetch(`/api/stores/${storeId}/settings`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(storeSettingsData),
                });

                if (!settingsResponse.ok) {
                  throw new Error('Failed to update store settings');
                }

                // Show success message
                toast.success('Store settings saved successfully!');
                
                // Refresh the page to show updated data
                window.location.reload();
              } catch (error) {
                console.error('Error saving store settings:', error);
                toast.error('Failed to save store settings. Please try again.');
              }
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
};
