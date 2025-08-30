'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Building2, 
  Users, 
  TrendingUp,
  Settings,
  BarChart3,
  FileText,
  Globe,
  Database,
  Activity
} from 'lucide-react';

export const SuperAdmin: React.FC = () => {
  const { user, logout, businesses } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout(() => router.push('/auth/login'));
  };

  const overviewFeatures = [
    {
      title: 'System Overview',
      description: 'Monitor system health and performance',
      icon: Shield,
      color: 'bg-blue-500',
      action: '/system-overview'
    },
    {
      title: 'Business Management',
      description: 'Manage all registered businesses',
      icon: Building2,
      color: 'bg-green-500',
      action: '/businesses'
    },
    {
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: Users,
      color: 'bg-purple-500',
      action: '/users'
    },
    {
      title: 'Global Analytics',
      description: 'View system-wide performance metrics',
      icon: BarChart3,
      color: 'bg-orange-500',
      action: '/analytics'
    }
  ];

  const menuFeatures = [
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      color: 'bg-indigo-500',
      action: '/system-settings'
    },
    {
      title: 'Database Management',
      description: 'Monitor and manage database',
      icon: Database,
      color: 'bg-teal-500',
      action: '/database'
    },
    {
      title: 'Activity Logs',
      description: 'View system activity logs',
      icon: Activity,
      color: 'bg-gray-500',
      action: '/logs'
    },
    {
      title: 'System Reports',
      description: 'Generate system reports',
      icon: FileText,
      color: 'bg-red-500',
      action: '/reports'
    },
    {
      title: 'Global Settings',
      description: 'Manage global configurations',
      icon: Globe,
      color: 'bg-yellow-500',
      action: '/global-settings'
    },
    {
      title: 'Security Center',
      description: 'Manage system security',
      icon: Shield,
      color: 'bg-pink-500',
      action: '/security'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || user?.username}</p>
              <p className="text-sm text-gray-500">System Administrator</p>
            </div>
            <div className="flex items-center gap-4">
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
                <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businesses?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Registered businesses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">System users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Current users</p>
              </CardContent>
            </Card>
          </div>

          {/* Overview Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => console.log(`Navigate to: ${feature.action}`)}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Menu Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => console.log(`Navigate to: ${feature.action}`)}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
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
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent system activities</p>
                <p className="text-sm text-muted-foreground">System activities will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
