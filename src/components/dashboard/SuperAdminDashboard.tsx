import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Header } from '@/components/common/Header';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Eye, Wrench, TrendingUp, Users, Building2, Loader2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DataTable } from '@/components/common/DataTable';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Import refactored components and helpers
import { QuickActions } from '@/components/superadmin/QuickActions';
import { StatsGrid } from '@/components/superadmin/StatsGrid';
import { SystemStatus } from '@/components/superadmin/SystemStatus';
import { MenuManagement } from '@/components/superadmin/MenuManagement';
import { getStatusIcon, getSubscriptionColor, calculateStats } from '@/components/superadmin/SuperAdminHelpers';

// Import React Query hooks
import { 
  usePlatformBusinesses, 
  useSubscriptionPlans
} from '@/utils/hooks/useStoreData';

interface SuperAdminDashboardProps {
  onNavigate: (route: string) => void;
}

// Type definitions for business data
interface Business {
  id: string;
  name: string;
  subscription_status?: string;
  subscription_plans?: {
    name: string;
  };
  stores?: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
  created_at?: string;
}

// Type definitions for subscription plans
interface SubscriptionPlan {
  name: string;
  price: string;
  status: string;
}

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
  } = usePlatformBusinesses({ enabled: user?.role === 'superadmin' });

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
    data: subscriptionPlans = [],
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans
  } = useSubscriptionPlans();

  const platformUsers = { total: 1250, newToday: 12 };

  // Combined loading states
  const isLoading = businessesLoading || plansLoading;

  // Handle tab switching
  const handleTabSwitch = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Handle navigation for external routes
  const handleNavigation = (route: string) => {
    if (route === 'menu-management') {
      setActiveTab('menu-management');
    } else {
      router.push(route);
    }
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
    } catch (error) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // DataTable columns configuration for businesses
  const businessColumns = [
    {
      key: 'business',
      header: 'Business',
      render: (business: Business) => (
        <div>
          <p className="font-medium">{business.name || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">ID: {business.id}</p>
        </div>
      )
    },
    {
      key: 'subscription',
      header: 'Subscription',
      render: (business: Business) => (
        <Badge variant={getSubscriptionColor(business.subscription_plans?.name || 'Unknown', business.subscription_status || 'Unknown')}>
          {business.subscription_plans?.name || 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (business: Business) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(business.subscription_status || 'Unknown')}
          <span className="capitalize">{business.subscription_status || 'Unknown'}</span>
        </div>
      )
    },
    {
      key: 'stores',
      header: 'Stores',
      render: (business: Business) => (
        <div>
          <span className="font-medium">{(business.stores || []).length}</span>
          <span className="text-sm text-muted-foreground ml-1">
            ({(business.stores || []).filter((s) => s.is_active).length} active)
          </span>
        </div>
      )
    },
    {
      key: 'created',
      header: 'Created',
      render: (business: Business) => (
        <div>
          {business.created_at ? new Date(business.created_at).toLocaleDateString() : 'Unknown'}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={`${systemSettings.platformName} ${translate('dashboard.title').replace('SCIMS', '')}`}
        subtitle={translate('dashboard.title').replace('SCIMS ', '') + ' - Stock Control & Inventory Management System'}
      >
        <div className="flex items-center gap-2">
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
          <Badge variant="outline">Super Admin</Badge>
        </div>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuickActions onNavigate={handleNavigation} translate={translate} />
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="menu-management">Menu Management</TabsTrigger>
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

          <TabsContent value="businesses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Recent Businesses
                    </CardTitle>
                    <CardDescription>Latest registered businesses on SCIMS</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetchBusinesses()}
                      disabled={businessesLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${businessesLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button onClick={() => handleNavigation('businesses')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  title=""
                  data={businesses?.slice(0, 5) || []}
                  columns={businessColumns}
                  searchable={false}
                  tableName="superadmin"
                  userRole={user?.role}
                  pagination={{
                    enabled: false
                  }}
                  emptyMessage={
                    businessesLoading 
                      ? 'Loading businesses...' 
                      : 'No businesses found. Create your first business to get started.'
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>SCIMS Plans</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetchPlans()}
                        disabled={plansLoading}
                      >
                        <RefreshCw className={`w-3 h-3 mr-2 ${plansLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button onClick={() => handleNavigation('subscriptions')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Current subscription offerings</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    title=""
                    data={subscriptionPlans}
                    columns={[
                      {
                        key: 'name',
                        header: 'Plan Name',
                        render: (plan: { id: string; name: string; price: string; status: string }) => (
                          <div className="font-medium">{plan.name}</div>
                        )
                      },
                      {
                        key: 'price',
                        header: 'Price',
                        render: (plan: { id: string; name: string; price: string; status: string }) => (
                          <div className="text-sm text-muted-foreground">{plan.price}</div>
                        )
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        render: (plan: { id: string; name: string; price: string; status: string }) => (
                          <Badge variant="secondary">{plan.status}</Badge>
                        )
                      }
                    ]}
                    searchable={false}
                    tableName="subscriptionPlans"
                    userRole={user?.role}
                    pagination={{
                      enabled: false
                    }}
                    emptyMessage="No subscription plans found"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Revenue by Plan</CardTitle>
                      <CardDescription>Monthly recurring revenue breakdown</CardDescription>
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
                  {subscriptionData.revenueByPlan.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={subscriptionData.revenueByPlan}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="plan" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                        <Bar dataKey="revenue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No revenue by plan data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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

          {/* Menu Management Tab */}
          <TabsContent value="menu-management" className="space-y-6">
            <MenuManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};