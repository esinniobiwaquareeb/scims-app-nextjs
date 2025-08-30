/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';
import { useActivityLogger } from '../contexts/ActivityLogger';
import { Header } from './common/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Store as StoreIcon, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Building, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Edit, 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  FileText,
  Shield,
  UserCheck,
  Truck,
  Tag,
  FolderOpen
} from 'lucide-react';
import { 
  useStoreSettings, 
  useStoreProducts, 
  useStoreSales,
  useStoreCustomers
} from '../utils/hooks/useStoreData';

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

export const StoreDetails: React.FC<StoreDetailsProps> = ({ onBack }) => {
  const { translate, formatCurrency, getCurrentCurrency } = useSystem();
  const { logActivity } = useActivityLogger();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  // Get store ID from sessionStorage
  const storeId = sessionStorage.getItem('selectedStoreId');
  const storeName = sessionStorage.getItem('selectedStoreName');

  // Fetch store data
  const {
    data: storeSettings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useStoreSettings(storeId || '', { 
    enabled: !!storeId 
  });

  // Store dashboard stats will be calculated from other data
  const dashboardStats = null;
  const isLoadingStats = false;
  const statsError = null;

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
    const errors = [settingsError, statsError, productsError, salesError, customersError].filter(Boolean);
    if (errors.length > 0) {
      const errorMessage = errors[0]?.message || 'Failed to load store data';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [settingsError, statsError, productsError, salesError, customersError]);

  // Loading state
  if (isLoadingSettings || isLoadingStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={`Store: ${storeName || 'Loading...'}`} onBack={onBack} />
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
          <div className="text-center">
            <p className="text-gray-600 mb-4">Store not found</p>
            <Button onClick={onBack}>
              Go Back
            </Button>
          </div>
    );
  }

  const store = storeSettings;
  const stats = dashboardStats || {};
  const storeProducts = products || [];
  const storeSales = sales || [];
  const storeCustomers = customers || [];
  
  // Calculate stats from available data
  const calculatedStats = {
    totalProducts: storeProducts.length,
    todaysSales: storeSales.filter((sale: { transaction_date: any; created_at: any; }) => {
      const saleDate = new Date(sale.transaction_date || sale.created_at);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString();
    }).length,
    totalCustomers: storeCustomers.length,
    ordersToday: storeSales.filter((sale: { transaction_date: any; created_at: any; }) => {
      const saleDate = new Date(sale.transaction_date || sale.created_at);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString();
    }).length
  };

  // Use calculated stats
  const typedStats = calculatedStats;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={`Store: ${store?.name || 'Loading...'}`}
        subtitle={store?.address ? `${store.address}, ${store.city || ''}, ${store.state || ''}` : 'Address not available'}
        showBackButton
        onBack={onBack}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Store Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-primary rounded-lg">
              <StoreIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-gray-600">
                {store.address && `${store.address}, `}
                {store.city && `${store.city}, `}
                {store.state && `${store.state}`}
                {store.postalCode && ` ${store.postalCode}`}
              </p>
              
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {store.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{store.phone}</span>
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{store.email}</span>
              </div>
            )}
            {store.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{store.website}</span>
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
                  <p className="text-2xl font-bold">{formatCurrency(typedStats.todaysSales)}</p>
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
                    <span className="font-medium">{store.name}</span>
                  </div>
                  {store.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{store.address}</span>
                    </div>
                  )}
                  {store.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{store.city}</span>
                    </div>
                  )}
                  {store.state && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">{store.state}</span>
                    </div>
                  )}
                  {store.postalCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Postal Code:</span>
                      <span className="font-medium">{store.postalCode}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{store.phone}</span>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{store.email}</span>
                    </div>
                  )}
                  {store.website && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Website:</span>
                      <span className="font-medium">{store.website}</span>
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
                    <span className="font-medium">{store.language || 'English'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Rate:</span>
                    <span className="font-medium">{store.taxRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Enabled:</span>
                    <Badge variant={store.enableTax ? "default" : "secondary"}>
                      {store.enableTax ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returns Allowed:</span>
                    <Badge variant={store.allowReturns ? "default" : "secondary"}>
                      {store.allowReturns ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {store.allowReturns && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Period:</span>
                      <span className="font-medium">{store.returnPeriodDays || 30} days</span>
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
                    <p className="text-gray-600">No products found in this store</p>
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

          {/* Settings Tab */}
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
                          <span className="text-gray-600">{store.receiptHeader || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Footer:</span>
                          <span className="text-gray-600">{store.receiptFooter || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custom Message:</span>
                          <span className="text-gray-600">{store.customReceiptMessage || 'Not set'}</span>
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
                              style={{ backgroundColor: store.theme?.primaryColor || '#3B82F6' }}
                            ></div>
                            <span className="text-gray-600">{store.theme?.primaryColor || '#3B82F6'}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Secondary Color:</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: store.theme?.secondaryColor || '#10B981' }}
                            ></div>
                            <span className="text-gray-600">{store.theme?.secondaryColor || '#10B981'}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Accent Color:</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: store.theme?.accentColor || '#F59E0B' }}
                            ></div>
                            <span className="text-gray-600">{store.theme?.accentColor || '#F59E0B'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {}}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
