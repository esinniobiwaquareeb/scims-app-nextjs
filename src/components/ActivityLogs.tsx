/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { useActivityLogs, useClearActivityLogs } from '@/utils/hooks/useStoreData';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Search, 
  Filter,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Calendar,
  User,
  Shield,
  Database,
  BarChart3
} from 'lucide-react';

interface ActivityLogsProps {
  onBack?: () => void; // Optional for backward compatibility
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
  severity: string;
  businessName?: string;
  storeName?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = () => {
  const { user, currentBusiness, currentStore } = useAuth();
  const { formatDate } = useSystem();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedAction, setSelectedAction] = useState('All');
  const [selectedUser, setSelectedUser] = useState('All');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Helper function to safely format timestamps
  const formatTimestamp = (timestamp: Date | string) => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date();
  };

  // Fetch activity logs using the new hook
  const { data: logs = [], isLoading, refetch } = useActivityLogs(
    currentBusiness?.id || '',
    {
      storeId: currentStore?.id,
      module: selectedModule === 'All' ? undefined : selectedModule,
      action: selectedAction === 'All' ? undefined : selectedAction,
      startDate: dateRange.from,
      endDate: dateRange.to,
      enabled: !!currentBusiness?.id || user?.role === 'superadmin',
      userRole: user?.role
    }
  );

  // Clear logs mutation
  const clearLogsMutation = useClearActivityLogs();

  // Apply search filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log: ActivityLog) =>
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.businessName && log.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.storeName && log.storeName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [logs, searchTerm]);

  // Get unique values for filters
  const uniqueModules = useMemo(() => ['All', ...Array.from(new Set(logs.map((log: ActivityLog) => log.module)))], [logs]);
  const uniqueActions = useMemo(() => ['All', ...Array.from(new Set(logs.map((log: ActivityLog) => log.action)))], [logs]);
  const uniqueUsers = useMemo(() => ['All', ...Array.from(new Set(logs.map((log: ActivityLog) => log.userName)))], [logs]);

  // Refresh data
  React.useEffect(() => {
    const refreshInterval = setInterval(() => {
    setLastRefresh(new Date());
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [refetch]);

  // Get severity styling
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Info className="w-4 h-4 text-blue-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Export functionality
  const exportLogs = () => {
    const csvContent = [
      'Timestamp,User,Role,Action,Module,Description,Severity,Business,Store,IP Address',
      ...filteredLogs.map((log: ActivityLog) => [
        log.timestamp.toISOString(),
        log.userName,
        log.userRole,
        log.action,
        log.module,
        `"${log.description}"`,
        log.severity,
        log.businessName || '',
        log.storeName || '',
        log.ipAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear logs (super admin only)
  const handleClearLogs = async () => {
    try {
      await clearLogsMutation.mutateAsync({
        businessId: currentBusiness?.id,
        storeId: currentStore?.id,
        userRole: user?.role
      });
      setShowClearDialog(false);
    } catch {
      // Error is handled by the mutation hook
    }
  };

  // Table columns
  const columns = [
    {
      key: 'timestamp',
      label: 'Time',
      render: (log: ActivityLog) => (
        <div className="text-sm">
          <p className="font-medium">{formatDate(log.timestamp)}</p>
          <p className="text-muted-foreground">
            {formatTimestamp(log.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (log: ActivityLog) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{log.userName}</p>
            <Badge variant="outline" className="text-xs">
              {log.userRole.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: ActivityLog) => (
        <div>
          <p className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</p>
          <p className="text-sm text-muted-foreground">{log.module}</p>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (log: ActivityLog) => (
        <div className="max-w-md">
          <p className="text-sm">{log.description}</p>
          {(log.businessName || log.storeName) && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Database className="w-3 h-3" />
              {log.businessName && `${log.businessName}`}
              {log.businessName && log.storeName && ' • '}
              {log.storeName && `${log.storeName}`}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (log: ActivityLog) => (
        <div className="flex items-center gap-2">
          {getSeverityIcon(log.severity)}
          <Badge variant={getSeverityColor(log.severity) as any}>
            {log.severity}
          </Badge>
        </div>
      )
    },
    {
      key: 'ip',
      label: 'IP Address',
      render: (log: ActivityLog) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono">{log.ipAddress || 'N/A'}</span>
        </div>
      )
    }
  ];

  // Statistics
  const stats = {
    total: filteredLogs.length,
    critical: filteredLogs.filter((l: ActivityLog) => l.severity === 'critical').length,
    high: filteredLogs.filter((l: ActivityLog) => l.severity === 'high').length,
    medium: filteredLogs.filter((l: ActivityLog) => l.severity === 'medium').length,
    low: filteredLogs.filter((l: ActivityLog) => l.severity === 'low').length
  };

  // Analytics data
  const recentActivities = filteredLogs.slice(0, 10);
  const actionBreakdown = uniqueActions.slice(1).map((action: unknown) => ({
    action: action as string,
    count: filteredLogs.filter((l: ActivityLog) => l.action === (action as string)).length
  })).sort((a: { count: number }, b: { count: number }) => b.count - a.count);

  // Loading skeleton
  if (isLoading) {
    return (
      <DashboardLayout
          title="Activity Logs"
          subtitle="Loading..."
      >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-6 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
        title="Activity Logs"
        subtitle={`System activity and audit trail${currentStore ? ` for ${currentStore.name}` : ''}`}
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {user?.role === 'superadmin' && (
            <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Logs
            </Button>
          )}
        </div>
      }
    >
        {/* Last Refresh Info */}
        <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Last refreshed: {lastRefresh.toLocaleString()}
          <span className="mx-2">•</span>
          <span>Role: {user?.role?.replace('_', ' ')}</span>
          {user?.role === 'superadmin' && (
            <>
              <span className="mx-2">•</span>
              <span className="text-green-600 font-medium">Viewing ALL activity logs</span>
            </>
          )}
          {user?.role === 'business_admin' && currentBusiness && (
            <>
              <span className="mx-2">•</span>
              <span className="text-blue-600 font-medium">Viewing logs for {currentBusiness.name}</span>
            </>
          )}
          {user?.role === 'store_admin' && currentStore && (
            <>
              <span className="mx-2">•</span>
              <span className="text-blue-600 font-medium">Viewing logs for {currentStore.name}</span>
            </>
          )}
          {user?.role === 'cashier' && (
            <>
              <span className="mx-2">•</span>
              <span className="text-blue-600 font-medium">Viewing your own logs</span>
            </>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                  <p className="text-2xl font-semibold">{stats.total.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-semibold text-red-600">{stats.critical.toLocaleString()}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High</p>
                  <p className="text-2xl font-semibold text-orange-600">{stats.high.toLocaleString()}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medium</p>
                  <p className="text-2xl font-semibold text-blue-600">{stats.medium.toLocaleString()}</p>
                </div>
                <Info className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.low.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-6">
            {/* Enhanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className="xl:col-span-2">
                    <Label htmlFor="search" className="mb-2 block">
                      Search
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="search"
                        placeholder="Search activities, users, descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="xl:col-span-2">
                    <Label htmlFor="date-range" className="mb-2 block">
                      Date Range
                    </Label>
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={(date) => {
                        if (date?.from && date?.to) {
                          setDateRange({ from: date.from, to: date.to });
                        }
                      }}
                      placeholder="Select date range"
                    />
                  </div>

                  <div>
                    <Label htmlFor="module" className="mb-2 block">
                      Module
                    </Label>
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                      <SelectTrigger id="module">
                        <SelectValue placeholder="All modules" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueModules.map(module => (
                          <SelectItem key={module as string} value={module as string}>
                            {module as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="action" className="mb-2 block">
                      Action
                    </Label>
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger id="action">
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueActions.map(action => (
                          <SelectItem key={action as string} value={action as string}>
                            {(action as string).replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="user" className="mb-2 block">
                      User
                    </Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger id="user">
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueUsers.map(userName => (
                          <SelectItem key={userName as string} value={userName as string}>
                            {userName as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {(selectedModule !== 'All' || selectedAction !== 'All' || selectedUser !== 'All' || searchTerm) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule !== 'All' && (
                        <Badge variant="secondary" className="text-xs">
                          Module: {selectedModule}
                        </Badge>
                      )}
                      {selectedAction !== 'All' && (
                        <Badge variant="secondary" className="text-xs">
                          Action: {selectedAction.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      {selectedUser !== 'All' && (
                        <Badge variant="secondary" className="text-xs">
                          User: {selectedUser}
                        </Badge>
                      )}
                      {searchTerm && (
                        <Badge variant="secondary" className="text-xs">
                          Search: &quot;{searchTerm}&quot;
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedModule('All');
                          setSelectedAction('All');
                          setSelectedUser('All');
                          setSearchTerm('');
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Logs Table */}
            <DataTable
              title="Activity Logs"
              data={filteredLogs}
              columns={columns}
              onExport={exportLogs}
              height={600}
              emptyMessage="No activity logs found. Try adjusting your filters or search terms."
              tableName="activityLogs"
              userRole={user?.role}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((log: ActivityLog) => (
                        <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          {getSeverityIcon(log.severity)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{log.userName}</span>
                              <span>•</span>
                              <span>{formatTimestamp(log.timestamp).toLocaleTimeString()}</span>
                              {log.module && (
                                <>
                                  <span>•</span>
                                  <span>{log.module}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Action Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actionBreakdown.length > 0 ? (
                      actionBreakdown.slice(0, 10).map((item) => (
                        <div key={item.action} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{item.action.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2 transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((item.count / Math.max(...actionBreakdown.map((a: { count: number }) => a.count))) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{item.count.toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No action data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      {/* Clear Logs Confirmation Dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Clear All Activity Logs</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all activity logs? This action cannot be undone and will permanently delete all log records from the database.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClearLogs}
                disabled={clearLogsMutation.isPending}
              >
                {clearLogsMutation.isPending ? 'Clearing...' : 'Clear All Logs'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};