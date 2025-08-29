'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useBusinessDashboardStats } from '@/utils/hooks/useStoreData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Store, 
  Package, 
  Users, 
  TrendingUp,
  Settings,
  BarChart3,
  FileText,
  Truck,
  Shield,
  Activity,
  RefreshCw,
  FolderOpen,
  Tag,
  UserCheck
} from 'lucide-react';

export const BusinessAdminDashboard: React.FC = () => {
  const { user, logout, currentBusiness } = useAuth();
  const router = useRouter();

  // Fetch business dashboard stats
  const { data: dashboardStats, isLoading, refetch } = useBusinessDashboardStats(
    currentBusiness?.id || '',
    { enabled: !!currentBusiness?.id }
  );

  const handleLogout = async () => {
    await logout(() => router.push('/auth/login'));
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleRefresh = () => {
    refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const overviewFeatures = [
    {
      title: 'Store Management',
      description: 'Manage multiple store locations',
      icon: Store,
      color: 'text-blue-600',
      action: '/stores'
    },
    {
      title: 'Business Analytics',
      description: 'View business-wide performance metrics',
      icon: BarChart3,
      color: 'text-green-600',
      action: '/reports'
    },
    {
      title: 'Inventory Overview',
      description: 'Monitor stock across all stores',
      icon: Package,
      color: 'text-purple-600',
      action: '/inventory'
    },
    {
      title: 'Staff Management',
      description: 'Manage employees and permissions',
      icon: Users,
      color: 'text-orange-600',
      action: '/staff'
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
      action: '/settings'
    },
    {
      title: 'Roles & Permissions',
      description: 'Manage staff roles and access permissions',
      icon: Shield,
      color: 'text-purple-600',
      action: '/roles-permissions'
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || user?.username}</p>
              {currentBusiness && (
                <p className="text-sm text-gray-500">Managing: {currentBusiness.name}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboardStats?.sales || 0)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Across all stores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardStats?.productsCount || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Across all stores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardStats?.storeCount || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Active locations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardStats?.orders || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Today&apos;s orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {dashboardStats?.lowStockCount > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Package className="w-5 h-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">
                  You have <strong>{dashboardStats.lowStockCount}</strong> products with low stock across all stores.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-4"
                    onClick={() => handleNavigation('/inventory')}
                  >
                    View Inventory
                  </Button>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNavigation(feature.action)}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Management Tools Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleNavigation(feature.action)}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activities</p>
                <p className="text-sm text-muted-foreground">
                  Activities will appear here as you manage your business
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleNavigation('/activity-logs')}
                >
                  View Activity Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
