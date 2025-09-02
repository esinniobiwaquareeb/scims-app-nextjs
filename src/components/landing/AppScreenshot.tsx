import React from 'react';
import { Card } from '../ui/card';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Store, 
  Settings,
  TrendingUp,
  FileText,
  CreditCard,
  Activity
} from 'lucide-react';

interface AppScreenshotProps {
  type: 'dashboard' | 'pos' | 'inventory' | 'analytics' | 'customers' | 'reports' | 'settings' | 'stores';
  className?: string;
}

export const AppScreenshot: React.FC<AppScreenshotProps> = ({ type, className = '' }) => {
  const screenshots = {
    dashboard: {
      title: 'Store Dashboard',
      icon: Store,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Today&apos;s Overview</h3>
            <div className="text-sm text-green-600">↗ 12% from yesterday</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$2,847</div>
              <div className="text-sm text-blue-800">Sales Today</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-green-800">Transactions</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">23</div>
              <div className="text-sm text-orange-800">Low Stock Items</div>
            </div>
          </div>
        </div>
      )
    },
    pos: {
      title: 'Point of Sale',
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-semibold">New Sale</span>
            <span className="text-sm text-muted-foreground">Transaction #1847</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>iPhone 14 Pro</span>
              <span>$999.00</span>
            </div>
            <div className="flex justify-between">
              <span>Wireless Charger</span>
              <span>$49.99</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (8.5%)</span>
              <span>$89.16</span>
            </div>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>$1,138.15</span>
            </div>
          </div>
        </div>
      )
    },
    inventory: {
      title: 'Inventory Management',
      icon: Package,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Stock Levels</h3>
            <div className="text-sm text-red-600">3 items need attention</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>iPhone 14 Pro</span>
              </div>
              <span className="text-sm">156 units</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>AirPods Pro</span>
              </div>
              <span className="text-sm">12 units</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>MacBook Air</span>
              </div>
              <span className="text-sm">3 units</span>
            </div>
          </div>
        </div>
      )
    },
    analytics: {
      title: 'Analytics & Reports',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Sales Trends</h3>
            <div className="text-sm text-green-600">This Month</div>
          </div>
          <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-end justify-between p-4">
            <div className="bg-blue-500 h-8 w-4 rounded-t"></div>
            <div className="bg-blue-500 h-12 w-4 rounded-t"></div>
            <div className="bg-blue-500 h-16 w-4 rounded-t"></div>
            <div className="bg-blue-500 h-20 w-4 rounded-t"></div>
            <div className="bg-blue-500 h-24 w-4 rounded-t"></div>
            <div className="bg-blue-500 h-28 w-4 rounded-t"></div>
            <div className="bg-blue-500 h-20 w-4 rounded-t"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Revenue: $45,230</div>
            <div>Growth: +18.2%</div>
          </div>
        </div>
      )
    },
    customers: {
      title: 'Customer Management',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Recent Customers</h3>
            <div className="text-sm text-blue-600">1,247 total</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">JD</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-muted-foreground">Last purchase: 2 days ago</div>
              </div>
              <div className="text-sm">$1,247</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">SM</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Sarah Miller</div>
                <div className="text-xs text-muted-foreground">Last purchase: 1 week ago</div>
              </div>
              <div className="text-sm">$892</div>
            </div>
          </div>
        </div>
      )
    },
    reports: {
      title: 'Advanced Reporting',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <h3 className="font-semibold">Monthly Report</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-700">$127K</div>
              <div className="text-sm text-green-600">Revenue</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-700">2,847</div>
              <div className="text-sm text-blue-600">Orders</div>
            </div>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Profit Margin</span>
              <span className="text-green-600">23.4%</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Retention</span>
              <span className="text-blue-600">87.2%</span>
            </div>
          </div>
        </div>
      )
    },
    settings: {
      title: 'System Settings',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <h3 className="font-semibold">Store Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Auto Backup</span>
              <div className="w-8 h-4 bg-green-500 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Low Stock Alerts</span>
              <div className="w-8 h-4 bg-green-500 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Receipt Printing</span>
              <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    stores: {
      title: 'Multi-Store Management',
      icon: Store,
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Store Locations</h3>
            <div className="text-sm text-blue-600">8 active stores</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Downtown Store</div>
                <div className="text-xs text-muted-foreground">New York, NY</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">$12.4K</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Mall Location</div>
                <div className="text-xs text-muted-foreground">Brooklyn, NY</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">$8.9K</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const screenshot = screenshots[type];
  const IconComponent = screenshot.icon;

  return (
    <Card className={`p-4 bg-white shadow-lg border-0 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{screenshot.title}</span>
      </div>
      {screenshot.content}
    </Card>
  );
};