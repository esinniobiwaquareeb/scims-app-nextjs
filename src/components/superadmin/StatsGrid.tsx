import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Building2, Store, Users, DollarSign, TrendingUp } from 'lucide-react';

interface Stats {
  totalRevenue: number;
  monthlyGrowth: number;
  totalBusinesses: number;
  activeStores: number;
}

interface PlatformUsers {
  total: number;
  newToday: number;
}

interface StatsGridProps {
  stats: Stats;
  platformUsers?: PlatformUsers;
  formatCurrency: (amount: number, currency?: string, showSymbol?: boolean) => string;
  translate: (key: string) => string;
}

export const StatsGrid = ({ stats, platformUsers = { total: 0, newToday: 0 }, formatCurrency, translate }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{translate('dashboard.platformRevenue')}</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue, undefined, false)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{translate('dashboard.totalBusinesses')}</p>
              <p className="text-2xl font-semibold">{stats.totalBusinesses}</p>
              <Progress value={Math.min((stats.totalBusinesses / 50) * 100, 100)} className="mt-2 h-2" />
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{translate('dashboard.activeStores')}</p>
              <p className="text-2xl font-semibold">{stats.activeStores}</p>
              <p className="text-sm text-muted-foreground mt-1">Across all businesses</p>
            </div>
            <Store className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{translate('dashboard.platformUsers')}</p>
              <p className="text-2xl font-semibold">{platformUsers?.total?.toLocaleString() || '0'}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-blue-600">+{platformUsers?.newToday || 0} today</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};