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
import { 
  Package, 
  Users, 
  Settings,
  BarChart3,
  FileText,
  Truck,
  ShoppingCart,
  AlertTriangle,
  Loader2,
  DollarSign,
  FolderOpen,
  Tag,
  UserCheck,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useStoreAdminDashboard } from '@/utils/hooks/useStoreAdminDashboard';



export const StoreAdminDashboard: React.FC = () => {
  const { user, logout, currentStore } = useAuth();
  const { formatCurrency } = useSystem();
  const router = useRouter();

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading 
  } = useStoreAdminDashboard(currentStore?.id || '', {
    enabled: !!currentStore?.id
  });

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
      color: 'text-blue-600',
      action: '/pos'
    },
    {
      title: 'Sales Report',
      description: 'View sales reports and analytics',
      icon: BarChart3,
      color: 'text-red-600',
      action: '/sales-report'
    },
    {
      title: 'Store Settings',
      description: 'Configure store preferences',
      icon: Settings,
      color: 'text-gray-600',
      action: '/stores'
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
      title: 'Restock',
      description: 'Manage replenishment and restock orders',
      icon: Truck,
      color: 'text-amber-600',
      action: '/restock'
    },
    {
      title: 'Suppliers',
      description: 'Manage your suppliers and vendors',
      icon: Users,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Store Admin Dashboard"
        subtitle={`Welcome back, ${user?.name || user?.username} • Managing: ${currentStore?.name || 'Store'}`}
      >
      </Header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading dashboard data...</p>
              </div>
            </div>
          ) : dashboardData?.stats ? (
            <StatsGrid 
              stats={{
                todaysSales: dashboardData.stats.todaySales,
                totalProducts: dashboardData.stats.totalProducts,
                lowStockItems: dashboardData.stats.lowStockItems,
                ordersToday: 0 // Orders count not yet implemented in API
              }}
              storeCount={1}
              isAllStores={false}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu</h2>
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
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Low Stock Alerts</span>
                {(dashboardData?.stats?.lowStockItems || 0) > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {dashboardData?.stats?.lowStockItems}
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
              ) : dashboardData?.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-orange-600">
                            Stock: {product.stock_quantity} (Min: {product.min_stock_level})
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Low Stock
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-muted-foreground font-medium">All products well stocked</p>
                  <p className="text-sm text-muted-foreground">No low stock alerts at this time</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Recent Activity</span>
                {currentStore?.id && (
                  <span className="text-sm font-normal text-muted-foreground">
                    • {currentStore.name}
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
              ) : dashboardData?.recentSales && dashboardData.recentSales.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Sale completed</p>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {sale.receipt_number}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.transaction_date).toLocaleDateString()}
                          {sale.total_amount && ` • ${formatCurrency(parseFloat(sale.total_amount))}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground font-medium">No recent activities</p>
                  <p className="text-sm text-muted-foreground">Activities will appear here as you use the system</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
