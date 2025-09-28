import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ShoppingCart
} from 'lucide-react';

interface StatsGridProps {
  stats: {
    todaysSales: number;
    totalProducts: number;
    lowStockItems: number;
    ordersToday: number;
  };
  storeCount?: number;
  isAllStores?: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, storeCount, isAllStores, formatCurrency }) => {
  return (
    <div className="space-y-4">
      {/* Store Count Indicator for All Stores View */}
      {isAllStores && storeCount && (
        <div className="flex items-center justify-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-700 font-medium">
              📊 Viewing combined data from <strong>{storeCount} stores</strong>
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Sales</p>
                <p className="text-2xl font-semibold">{formatCurrency(stats.todaysSales)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-semibold">{stats.totalProducts}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-semibold">{stats.lowStockItems}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-semibold">{stats.ordersToday}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
