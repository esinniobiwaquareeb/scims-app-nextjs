'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/common/Header';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { FeatureCard } from '@/components/dashboard/FeatureCard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Users, 
  Settings,
  BarChart3,
  FileText,
  Truck,
  Building2,
  FolderOpen,
  Tag,
  UserCheck,
  Shield,
  Activity,
  Loader2,
  AlertTriangle,
  DollarSign,
  Store,
  ShoppingCart,
  RotateCcw
} from 'lucide-react';
import { useBusinessDashboardStats, useStoreDashboardStats } from '@/utils/hooks/useStoreData';

export const BusinessAdminDashboard: React.FC = () => {
  const { user, logout, currentBusiness, currentStore } = useAuth();
  const { formatCurrency } = useSystem();
  const router = useRouter();

  // Fetch business dashboard stats
  const { data: businessDashboardStats, isLoading: isLoadingBusinessStats } = useBusinessDashboardStats(
    currentBusiness?.id || '',
    { enabled: !!currentBusiness?.id && !currentStore } // Only fetch business stats when no store is selected
  );

  // Fetch store-specific dashboard stats when a store is selected
  const { data: storeDashboardStats, isLoading: isLoadingStoreStats } = useStoreDashboardStats(
    currentStore?.id || '',
    { enabled: !!currentStore?.id } // Only fetch store stats when a store is selected
  );

  // Combined loading state
  const isLoading = isLoadingBusinessStats || isLoadingStoreStats;

  // Use store-specific stats if available, otherwise use business-wide stats
  const dashboardStats = currentStore ? storeDashboardStats : businessDashboardStats;

  const handleLogout = async () => {
    await logout(() => router.push('/auth/login'));
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const overviewFeatures = [
    {
      title: 'Point of Sale',
      description: 'Process sales and manage transactions',
      icon: ShoppingCart,
      color: 'text-orange-600',
      action: '/pos'
    },
    {
      title: 'Store Management',
      description: 'Manage multiple store locations',
      icon: Store,
      color: 'text-blue-600',
      action: '/stores'
    },
    {
      title: 'Business Settings',
      description: 'Configure business preferences',
      icon: Settings,
      color: 'text-green-600',
      action: '/business-settings'
    },
    {
      title: 'Sales Report',
      description: 'View sales reports and analytics',
      icon: BarChart3,
      color: 'text-purple-600',
      action: '/sales-report'
    },
    {
      title: 'Supply Management',
      description: 'Manage supply orders, returns, and payments',
      icon: RotateCcw,
      color: 'text-orange-600',
      action: '/supply-management'
    }
  ];

  const menuFeatures = [
    {
      title: 'Products',
      description: 'Manage your inventory and products',
      icon: Package,
      color: 'text-green-600',
      action: '/products'
    },
    {
      title: 'Product Sync',
      description: 'Sync products across all stores in your business',
      icon: Truck,
      color: 'text-indigo-600',
      action: '/product-sync'
    },
    {
      title: 'Categories',
      description: 'Organize products into categories',
      icon: FolderOpen,
      color: 'text-purple-600',
      action: '/categories'
    },
    {
      title: 'Brands',
      description: 'Manage product brands',
      icon: Tag,
      color: 'text-orange-600',
      action: '/brands'
    },
    {
      title: 'Suppliers',
      description: 'Manage your suppliers and vendors',
      icon: Truck,
      color: 'text-indigo-600',
      action: '/suppliers'
    },
    {
      title: 'Customers',
      description: 'Manage customer information and history',
      icon: UserCheck,
      color: 'text-pink-600',
      action: '/customers'
    },
    {
      title: 'Cashiers',
      description: 'Manage cashiers and staff',
      icon: UserCheck,
      color: 'text-yellow-600',
      action: '/cashiers'
    },
    {
      title: 'Restock',
      description: 'Manage replenishment and restock orders',
      icon: Truck,
      color: 'text-amber-600',
      action: '/restock'
    },
    {
      title: 'Business Settings',
      description: 'Configure business preferences',
      icon: Settings,
      color: 'text-gray-600',
      action: '/business-settings'
    },
    {
      title: 'Roles & Permissions',
      description: 'Manage staff roles and access permissions',
      icon: Shield,
      color: 'text-purple-600',
      action: '/roles'
    },
    {
      title: 'Reports',
      description: 'View comprehensive business reports',
      icon: FileText,
      color: 'text-red-600',
      action: '/reports'
    },
    {
      title: 'Activity Logs',
      description: 'View system activity and audit logs',
      icon: BarChart3,
      color: 'text-teal-600',
      action: '/activity-logs'
    }
  ];

  // Business type display similar to React app
  const getBusinessTypeDisplay = () => {
    if (!currentBusiness) return { label: 'Business', icon: '🏢' };
    
    const businessType = currentBusiness.business_type || 'retail';
    const typeMap: Record<string, { label: string; icon: string }> = {
      retail: { label: 'Retail Business', icon: '🛍️' },
      restaurant: { label: 'Restaurant', icon: '🍽️' },
      service: { label: 'Service Business', icon: '🔧' },
      hybrid: { label: 'Hybrid Business', icon: '🏢' },
      pharmacy: { label: 'Pharmacy', icon: '💊' }
    };
    
    return typeMap[businessType] || { label: 'Business', icon: '🏢' };
  };

  const businessTypeDisplay = getBusinessTypeDisplay();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Business Admin Dashboard"
        subtitle={`Welcome back, ${user?.name || user?.username} • ${businessTypeDisplay.label}`}
      >
        {/* Business Type Indicator */}
        {user?.role === 'business_admin' && currentBusiness && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-800">
            <span className="text-lg">{businessTypeDisplay.icon}</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {businessTypeDisplay.label}
            </span>
          </div>
        )}
      </Header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : dashboardStats ? (
            <StatsGrid 
              stats={{
                todaysSales: dashboardStats.sales || 0,
                totalProducts: dashboardStats.productsCount || 0,
                lowStockItems: dashboardStats.lowStockCount || 0,
                ordersToday: dashboardStats.orders || 0
              }}
              storeCount={dashboardStats.storeCount || 0}
              isAllStores={!currentStore}
              formatCurrency={formatCurrency}
            />
          ) : null}

          {/* Overview Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                  onClick={() => handleNavigate(feature.action)}
                />
              ))}
            </div>
          </div>

          {/* Menu Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                  onClick={() => handleNavigate(feature.action)}
                />
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span>Low Stock Alerts</span>
                {(dashboardStats?.lowStockCount || 0) > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {dashboardStats?.lowStockCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading low stock alerts...</p>
                </div>
              ) : (dashboardStats?.lowStockCount || 0) > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Low Stock Products</p>
                        <p className="text-xs text-orange-600">
                          {dashboardStats.lowStockCount} products need attention{currentStore ? ` at ${currentStore.name}` : ' across all stores'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNavigate('/products')}
                    >
                      View Inventory
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">All products well stocked</p>
                  <p className="text-sm text-muted-foreground">No low stock alerts at this time</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Activity
                {currentBusiness?.id && (
                  <span className="text-sm font-normal text-muted-foreground">
                    • {currentBusiness.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading recent activities...</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activities</p>
                  <p className="text-sm text-muted-foreground">
                    Activities will appear here as you manage your business
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleNavigate('/activity-logs')}
                  >
                    View Activity Logs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
