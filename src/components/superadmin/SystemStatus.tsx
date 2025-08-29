import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2, Settings, Activity, CreditCard } from 'lucide-react';

export const SystemStatus = ({ systemSettings, translate, onNavigate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{translate('dashboard.systemStatus')}</CardTitle>
          <CardDescription>Current platform operational status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">System Health</span>
            <Badge variant="default">Operational</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Demo Mode</span>
            <Badge variant={systemSettings.demoMode ? "secondary" : "outline"}>
              {systemSettings.demoMode ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Maintenance Mode</span>
            <Badge variant={systemSettings.maintenanceMode ? "destructive" : "outline"}>
              {systemSettings.maintenanceMode ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Platform Version</span>
            <span className="text-sm font-medium">{systemSettings.platformVersion}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{translate('settings.currency')}</span>
            <span className="text-sm font-medium">{systemSettings.defaultCurrency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{translate('settings.language')}</span>
            <span className="text-sm font-medium">
              {systemSettings.supportedLanguages.find((l) => l.code === systemSettings.defaultLanguage)?.name}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{translate('dashboard.quickActions')}</CardTitle>
          <CardDescription>Frequently used administrative actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('businesses')}>
            <Building2 className="w-4 h-4 mr-2" />
            Manage Businesses
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('platform-settings')}>
            <Settings className="w-4 h-4 mr-2" />
            System Configuration
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('activity-logs')}>
            <Activity className="w-4 h-4 mr-2" />
            View Activity Logs
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('subscriptions')}>
            <CreditCard className="w-4 h-4 mr-2" />
            Subscription Plans
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};