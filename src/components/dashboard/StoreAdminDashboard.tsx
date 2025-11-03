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


  return (
    <DashboardLayout
      title="Store Admin Dashboard"
      subtitle={`Welcome back, ${user?.name || user?.username} • Managing: ${currentStore?.name || 'Store'}`}
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
                    <div key={product.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
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
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">No recent activities</p>
                  <p className="text-sm text-muted-foreground">Activities will appear here as you use the system</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  );
};
