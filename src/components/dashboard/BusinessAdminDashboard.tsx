/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/common/Header';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { 
  Package, 
  Users, 
  Settings,
  BarChart3,
  FileText,
  Truck,
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
  const { user, currentBusiness, currentStore } = useAuth();
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
    <DashboardLayout
      title="Business Admin Dashboard"
      subtitle={`Welcome back, ${user?.name || user?.username} • ${businessTypeDisplay.label}`}
      headerActions={
        <>
          {/* Business Type Indicator - Hidden on mobile */}
          {user?.role === 'business_admin' && currentBusiness && (
            <div className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-muted rounded-lg px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-border">
              <span className="text-base sm:text-lg">{businessTypeDisplay.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                {businessTypeDisplay.label}
              </span>
            </div>
          )}
          <NotificationBell className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <Button 
            onClick={() => router.push('/pos')} 
            variant="outline"
            className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 shrink-0"
            size="sm"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Open POS</span>
          </Button>
        </>
      }
    >
        <div className="space-y-8">
          {/* Stats Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading dashboard data...</p>
              </div>
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

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
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
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-600" />
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
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-foreground font-medium">All products well stocked</p>
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
                {currentStore ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    • {currentStore.name}
                  </span>
                ) : currentBusiness?.id && (
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
              ) : dashboardStats?.recentSales && dashboardStats.recentSales.length > 0 ? (
                <div className="space-y-4">
                  {dashboardStats.recentSales.map((sale: any) => (
                    <div key={sale.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">Sale completed</p>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                            {sale.receipt_number}
                          </span>
                          {!currentStore && sale.store_name && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                              {sale.store_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.transaction_date).toLocaleDateString()}
                          {sale.total_amount && ` • ${formatCurrency(parseFloat(sale.total_amount))}`}
                          {sale.customer?.name && ` • ${sale.customer.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No recent activities</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Activities will appear here as you manage your business
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigate('/activity-logs')}
                  >
                    View Activity Logs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  );
};
