/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
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
        <div className="container mx-auto px-4 py-6">
        {/* Store Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-primary rounded-lg">
              <StoreIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{storeData?.name || store?.name}</h1>
              <p className="text-gray-600">
                {storeData?.address && `${storeData.address}, `}
                {storeData?.city && `${storeData.city}, `}
                {storeData?.state && `${storeData.state}`}
                {storeData?.postal_code && ` ${storeData.postal_code}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {storeData?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{storeData.phone}</span>
              </div>
            )}
            {storeData?.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{storeData.email}</span>
              </div>
            )}
            {storeData?.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{storeData.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{typedStats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today&apos;s Sales</p>
                  <p className="text-2xl font-bold">{formatCurrency(typedStats.todaysSalesRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">{typedStats.todaysSalesCount} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">{typedStats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Orders Today</p>
                  <p className="text-2xl font-bold">{typedStats.ordersToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Store Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{storeData?.name || store?.name}</span>
                  </div>
                  {storeData?.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{storeData.address}</span>
                    </div>
                  )}
                  {storeData?.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{storeData.city}</span>
                    </div>
                  )}
                  {storeData?.state && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">{storeData.state}</span>
                    </div>
                  )}
                  {storeData?.postal_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Postal Code:</span>
                      <span className="font-medium">{storeData.postal_code}</span>
                    </div>
                  )}
                  {storeData?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{storeData.phone}</span>
                    </div>
                  )}
                  {storeData?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{storeData.email}</span>
                    </div>
                  )}
                  {storeData?.website && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Website:</span>
                      <span className="font-medium">{storeData.website}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Business Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">{getCurrentCurrency()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{storeData?.language || 'English'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales Revenue:</span>
                    <span className="font-medium">{formatCurrency(typedStats.totalSalesRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transactions:</span>
                    <span className="font-medium">{typedStats.totalSalesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Rate:</span>
                    <span className="font-medium">{storeData?.taxRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Enabled:</span>
                    <Badge variant={storeData?.enableTax ? "default" : "secondary"}>
                      {storeData?.enableTax ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returns Allowed:</span>
                    <Badge variant={storeData?.allowReturns ? "default" : "secondary"}>
                      {storeData?.allowReturns ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {storeData?.allowReturns && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Period:</span>
                      <span className="font-medium">{storeData?.returnPeriodDays || 30} days</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Store Products ({storeProducts.length})
                </CardTitle>
                <CardDescription>
                  All products available in this store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p>Loading products...</p>
                  </div>
                ) : storeProducts.length > 0 ? (
                  <div className="space-y-3">
                    {storeProducts.slice(0, 10).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              SKU: {product.sku || 'N/A'} • 
                              Stock: {product.stock_quantity || 0}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.price || 0)}</p>
                          <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                            {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {storeProducts.length > 10 && (
                      <div className="text-center py-4">
                        <p className="text-gray-600">
                          Showing 10 of {storeProducts.length} products
                        </p>
                        <Button variant="outline" className="mt-2">
                          View All Products
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-600 mb-4">This store doesn&apos;t have any products yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Recent Sales ({storeSales.length})
                </CardTitle>
                <CardDescription>
                  Recent sales transactions for this store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p>Loading sales...</p>
                  </div>
                ) : storeSales.length > 0 ? (
                  <div className="space-y-3">
                    {storeSales.slice(0, 10).map((sale: any) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Sale #{sale.id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(sale.created_at).toLocaleDateString()} • 
                              {sale.items?.length || 0} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(sale.total_amount || 0)}</p>
                          <Badge variant="default">Completed</Badge>
                        </div>
                      </div>
                    ))}
                    {storeSales.length > 10 && (
                      <div className="text-center py-4">
                        <p className="text-gray-600">
                          Showing 10 of {storeSales.length} sales
                        </p>
                        <Button variant="outline" className="mt-2">
                          View All Sales
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sales found for this store</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Store Customers ({storeCustomers.length})
                </CardTitle>
                <CardDescription>
                  Customers who have made purchases at this store
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCustomers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p>Loading customers...</p>
                  </div>
                ) : storeCustomers.length > 0 ? (
                  <div className="space-y-3">
                    {storeCustomers.slice(0, 10).map((customer: any) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">
                              {customer.phone || 'No phone'} • 
                              {customer.email || 'No email'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {customer.total_purchases || 0} purchases
                          </p>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    ))}
                    {storeCustomers.length > 10 && (
                      <div className="text-center py-4">
                        <p className="text-gray-600">
                          Showing 10 of {storeCustomers.length} customers
                        </p>
                        <Button variant="outline" className="mt-2">
                          View All Customers
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No customers found for this store</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Only show if user has access */}
          {hasAccessToStore && (
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Store Settings
                  </CardTitle>
                  <CardDescription>
                    Configure store preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Receipt Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Header:</span>
                            <span className="text-gray-600">{storeData.receiptHeader || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Footer:</span>
                            <span className="text-gray-600">{storeData.receiptFooter || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custom Message:</span>
                            <span className="text-gray-600">{storeData.customReceiptMessage || 'Not set'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Theme Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Primary Color:</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: storeData.theme?.primaryColor || '#3B82F6' }}
                              ></div>
                              <span className="text-gray-600">{storeData.theme?.primaryColor || '#3B82F6'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Secondary Color:</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: storeData.theme?.secondaryColor || '#10B981' }}
                              ></div>
                              <span className="text-gray-600">{storeData.theme?.secondaryColor || '#10B981'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Accent Color:</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: storeData.theme?.accentColor || '#F59E0B' }}
                              ></div>
                              <span className="text-gray-600">{storeData.theme?.accentColor || '#F59E0B'}</span>
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
