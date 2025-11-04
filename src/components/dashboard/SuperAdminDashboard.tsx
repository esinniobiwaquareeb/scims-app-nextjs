import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Wrench, TrendingUp, Users, Loader2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DataTable } from '@/components/common/DataTable';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Import refactored components and helpers
import { StatsGrid } from '@/components/superadmin/StatsGrid';
import { SystemStatus } from '@/components/superadmin/SystemStatus';
import { calculateStats } from '@/components/superadmin/SuperAdminHelpers';

// Import React Query hooks
import { 
  useSubscriptionPlans
} from '@/utils/hooks/useStoreData';

import {useBusinesses} from '@/utils/hooks/business';


// Type definitions for platform health metrics
interface PlatformHealthMetric {
  id: string;
  metric: string;
  value: string;
  progress: number;
  status: string;
}

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { systemSettings, formatCurrency, translate } = useSystem();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  // Use React Query hooks for data fetching with refetch capabilities
  const {
    data: businesses = [],
    isLoading: businessesLoading,
    error: businessesError,
    refetch: refetchBusinesses
  } = useBusinesses({ enabled: user?.role === 'superadmin' });

  // Mock data for missing hooks - these would be replaced with actual API calls
  const revenueData: Array<{ date: string; revenue: number }> = [
    { date: '2024-01-01', revenue: 15000 },
    { date: '2024-01-02', revenue: 18000 },
    { date: '2024-01-03', revenue: 22000 },
    { date: '2024-01-04', revenue: 19000 },
    { date: '2024-01-05', revenue: 25000 },
    { date: '2024-01-06', revenue: 28000 },
    { date: '2024-01-07', revenue: 32000 }
  ];

  const userGrowthData: Array<{ date: string; users: number }> = [
    { date: '2024-01-01', users: 45 },
    { date: '2024-01-02', users: 52 },
    { date: '2024-01-03', users: 58 },
    { date: '2024-01-04', users: 61 },
    { date: '2024-01-05', users: 67 },
    { date: '2024-01-06', users: 73 },
    { date: '2024-01-07', users: 79 }
  ];

  const platformHealth = {
    uptime: 99.8,
    apiResponseTime: 125,
    customerSatisfaction: 4.8,
    supportResolution: 2.3
  };

  const subscriptionData = {
    distribution: [
      { name: 'Basic', value: 25, color: '#8884d8' },
      { name: 'Premium', value: 45, color: '#82ca9d' },
      { name: 'Enterprise', value: 30, color: '#ffc658' }
    ],
    revenueByPlan: [
      { plan: 'Basic', revenue: 2500 },
      { plan: 'Premium', revenue: 4500 },
      { plan: 'Enterprise', revenue: 8000 }
    ]
  };

  const {
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans
  } = useSubscriptionPlans();

  const platformUsers = { total: 1250, newToday: 12 };

  // Combined loading states
  const isLoading = businessesLoading || plansLoading;

  // Handle navigation for external routes
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  // Combined error state
  const hasError = businessesError || plansError;

  // Refetch all data
  const refetchAllData = async () => {
    try {
      await Promise.all([
        refetchBusinesses(),
        refetchPlans()
      ]);
      toast.success('Dashboard data refreshed successfully');
    } catch {
      toast.error('Failed to refresh some data');
    }
  };

  // Force re-render when system settings change
  useEffect(() => {
    const handleSettingsChange = () => {
      setSelectedPeriod(prev => prev);
    };

    window.addEventListener('systemSettingsChanged', handleSettingsChange);
    return () => window.removeEventListener('systemSettingsChanged', handleSettingsChange);
  }, []);

  const stats = calculateStats(businesses, revenueData);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <DashboardLayout
        title={`${systemSettings.platformName} ${translate('dashboard.title').replace('SCIMS', '')}`}
        subtitle="Loading analytics data..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Prepare header actions
  const headerActions = (
    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
      {systemSettings.demoMode && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Demo Mode
        </Badge>
      )}
      {systemSettings.maintenanceMode && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Wrench className="w-3 h-3" />
          {translate('settings.maintenance')}
        </Badge>
      )}
    </div>
  );

  return (
    <DashboardLayout
      title={`${systemSettings.platformName} ${translate('dashboard.title').replace('SCIMS', '')}`}
      subtitle={translate('dashboard.title').replace('SCIMS ', '') + ' - Stock Control & Inventory Management System'}
      headerActions={headerActions}
    >
        <StatsGrid stats={stats} platformUsers={platformUsers} formatCurrency={formatCurrency} translate={translate} />

        {hasError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800 text-sm">Failed to load some analytics data. Please refresh the page.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetchAllData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-3 h-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Platform revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                        <YAxis tickFormatter={(value) => formatCurrency(value / 1000) + 'k'} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No revenue data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Subscription Distribution
                  </CardTitle>
                  <CardDescription>Current subscription plan breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {subscriptionData.distribution.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={subscriptionData.distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {subscriptionData.distribution.map((entry: { color: string }, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center flex-wrap gap-4 mt-4">
                        {subscriptionData.distribution.map((item: { name: string; value: number; color: string }, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name} ({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No subscription data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <SystemStatus 
              systemSettings={systemSettings} 
              translate={translate} 
              onNavigate={handleNavigation} 
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>New user registrations over time</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetchAllData()}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userGrowthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No user growth data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>SCIMS Platform Health</CardTitle>
                      <CardDescription>System performance metrics</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetchAllData()}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    title=""
                    data={[
                      {
                        id: 'uptime',
                        metric: 'System Uptime',
                        value: `${platformHealth.uptime || 99.8}%`,
                        progress: platformHealth.uptime || 99.8,
                        status: 'good'
                      },
                      {
                        id: 'api-response',
                        metric: 'API Response Time',
                        value: `${platformHealth.apiResponseTime || 125}ms`,
                        progress: 85,
                        status: 'warning'
                      },
                      {
                        id: 'satisfaction',
                        metric: 'Customer Satisfaction',
                        value: `${platformHealth.customerSatisfaction || 4.8}/5`,
                        progress: 96,
                        status: 'excellent'
                      },
                      {
                        id: 'support-resolution',
                        metric: 'Support Resolution',
                        value: `${platformHealth.supportResolution || 2.3}hrs avg`,
                        progress: 78,
                        status: 'good'
                      }
                    ]}
                    columns={[
                      {
                        key: 'metric',
                        header: 'Metric',
                        render: (item: PlatformHealthMetric) => (
                          <div className="text-sm">{item.metric}</div>
                        )
                      },
                      {
                        key: 'value',
                        header: 'Value',
                        render: (item: PlatformHealthMetric) => (
                          <div className="text-sm font-medium">{item.value}</div>
                        )
                      },
                      {
                        key: 'progress',
                        header: 'Progress',
                        render: (item: PlatformHealthMetric) => (
                          <div className="w-full">
                            <Progress value={item.progress} className="h-2" />
                          </div>
                        )
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        render: (item: PlatformHealthMetric) => {
                          let variant: "default" | "secondary" | "destructive" | "outline" = "default";
                          if (item.status === 'excellent') variant = "default";
                          else if (item.status === 'good') variant = "secondary";
                          else if (item.status === 'warning') variant = "outline";
                          else if (item.status === 'critical') variant = "destructive";
                          
                          return (
                            <Badge variant={variant} className="capitalize">
                              {item.status}
                            </Badge>
                          );
                        }
                      }
                    ]}
                    searchable={false}
                    tableName="reports"
                    userRole={user?.role}
                    pagination={{
                      enabled: false
                    }}
                    emptyMessage="No platform health data available"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </DashboardLayout>
  );
};