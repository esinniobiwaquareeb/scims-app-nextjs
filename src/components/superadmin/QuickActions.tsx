import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Building2, CreditCard, Settings, Activity, Menu } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (route: string) => void;
  translate: (key: string) => string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate, translate }) => {
  const actions = [
    {
      key: 'business',
      title: translate('management.businesses'),
      description: 'Manage registered businesses',
      icon: Building2,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      key: 'subscriptions',
      title: translate('management.subscriptions'),
      description: 'Create and manage pricing plans',
      icon: CreditCard,
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      key: 'menu-management',
      title: 'Menu Management',
      description: 'Manage menus for different business types',
      icon: Menu,
      color: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      key: 'platform-settings',
      title: translate('settings.platformSettings'),
      description: 'Configure system settings',
      icon: Settings,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      key: 'activity-logs',
      title: 'Activity Logs',
      description: 'View system activity and audit trail',
      icon: Activity,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Card 
            key={action.key}
            className="cursor-pointer hover:shadow-lg transition-shadow" 
            onClick={() => onNavigate(action.key)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    {action.title}
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </div>
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};