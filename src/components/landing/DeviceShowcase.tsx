import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Smartphone, Tablet, Monitor, CreditCard, Wifi, WifiOff, MessageSquare, Mail, Send } from 'lucide-react';

export const DeviceShowcase = () => {
  const devices = [
    {
      type: 'POS Terminal',
      icon: CreditCard,
      image: '🖥️',
      description: 'Handheld & Desktop POS',
      features: ['Touch Screen', 'Receipt Printer', 'Barcode Scanner', 'Cash Drawer'],
      status: 'Works Offline'
    },
    {
      type: 'Tablet',
      icon: Tablet,
      image: '📱',
      description: 'Android & iOS Tablets',
      features: ['Mobile POS', 'Inventory Management', 'Customer Orders', 'Reports'],
      status: 'Auto Sync'
    },
    {
      type: 'Smartphone',
      icon: Smartphone,
      image: '📲',
      description: 'Android & iOS Phones',
      features: ['Mobile Sales', 'Quick Checkout', 'Stock Checks', 'Notifications'],
      status: 'Always Ready'
    },
    {
      type: 'Computer',
      icon: Monitor,
      image: '💻',
      description: 'Windows, Mac & Linux',
      features: ['Full Dashboard', 'Advanced Reports', 'Multi-store', 'Admin Panel'],
      status: 'Cloud Based'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {devices.map((device, index) => (
        <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 group">
          <div className="mb-4">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">{device.image}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{device.type}</h3>
            <p className="text-sm text-muted-foreground mb-3">{device.description}</p>
            <Badge variant="secondary" className="text-xs">
              {device.status}
            </Badge>
          </div>
          <div className="space-y-2">
            {device.features.map((feature, i) => (
              <div key={i} className="flex items-center text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export const DeviceInterface = ({ type = 'tablet' }) => {
  const getInterface = () => {
    switch (type) {
      case 'pos':
        return (
          <div className="bg-gray-900 rounded-lg p-4 text-white text-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-green-400">●</span>
              <span>SCIMS POS Terminal</span>
              <span className="text-xs">14:30</span>
            </div>
            <div className="bg-gray-800 rounded p-3 mb-3">
              <div className="text-xs text-gray-400 mb-1">Current Sale</div>
              <div className="flex justify-between">
                <span>Rice 50kg</span>
                <span>₦25,000</span>
              </div>
              <div className="flex justify-between">
                <span>Beans 25kg</span>
                <span>₦15,000</span>
              </div>
              <hr className="my-2 border-gray-600" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₦40,000</span>
              </div>
            </div>
            <div className="flex space-x-2 text-xs">
              <div className="bg-blue-600 rounded px-2 py-1">Cash</div>
              <div className="bg-gray-700 rounded px-2 py-1">Card</div>
              <div className="bg-gray-700 rounded px-2 py-1">Transfer</div>
            </div>
          </div>
        );
      
      case 'phone':
        return (
          <div className="bg-white rounded-2xl p-3 shadow-xl border max-w-[200px]">
            <div className="flex justify-between items-center mb-2 text-xs">
              <span>9:41</span>
              <span className="flex space-x-1">
                <Wifi className="w-3 h-3" />
                <span>●●●</span>
              </span>
            </div>
            <div className="text-center mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg mx-auto mb-1 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-medium">SCIMS Mobile</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-gray-100 rounded p-2">
                <div className="font-medium">Today&apos;s Sales</div>
                <div className="text-lg font-bold">₦85,500</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-blue-50 rounded p-1 text-center">
                  <div className="font-medium">POS</div>
                </div>
                <div className="bg-green-50 rounded p-1 text-center">
                  <div className="font-medium">Products</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 rounded-xl p-4 max-w-sm">
            <div className="flex justify-between items-center mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <CreditCard className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium">SCIMS Dashboard</span>
              </div>
              <div className="text-xs text-gray-500">● Online</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="bg-white rounded p-2 text-center">
                <div className="font-bold text-lg">₦240K</div>
                <div className="text-gray-500">Sales</div>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <div className="font-bold text-lg">1,245</div>
                <div className="text-gray-500">Products</div>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <div className="font-bold text-lg">67</div>
                <div className="text-gray-500">Customers</div>
              </div>
            </div>
            <div className="bg-white rounded p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Recent Sales</span>
                <span className="text-xs text-gray-500">View all</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Rice & Beans</span>
                  <span>₦40,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Palm Oil</span>
                  <span>₦12,000</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center">
      {getInterface()}
    </div>
  );
};