import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'expired': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'cancelled': return <AlertCircle className="w-4 h-4 text-orange-600" />;
    default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

export const getSubscriptionColor = (subscription: string, status: string) => {
  if (status === 'expired' || status === 'cancelled') return 'destructive';
  switch (subscription) {
    case 'trial': return 'secondary';
    case 'basic': return 'default';
    case 'premium': return 'default';
    case 'enterprise': return 'default';
    default: return 'secondary';
  }
};

interface Business {
  id: string;
  name: string;
  stores?: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
}

interface RevenueData {
  date: string;
  revenue: number;
}

export const calculateStats = (businesses: Business[], revenueData: RevenueData[] = []) => {
  // Provide safe defaults if businesses is undefined or null
  const safeBusinesses = businesses || [];
  
  // Calculate total revenue from recent revenue data
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  
  // Calculate monthly growth from revenue data
  let monthlyGrowth = 0;
  if (revenueData.length >= 2) {
    const currentMonthRevenue = revenueData.slice(-15).reduce((sum, item) => sum + (item.revenue || 0), 0); // Last 15 days as current month
    const previousMonthRevenue = revenueData.slice(-30, -15).reduce((sum, item) => sum + (item.revenue || 0), 0); // Previous 15 days as previous month
    
    if (previousMonthRevenue > 0) {
      monthlyGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }
  }
  
  return {
    totalRevenue: Math.round(totalRevenue),
    totalBusinesses: safeBusinesses.length,
    activeStores: safeBusinesses.reduce((sum, b) => {
      // Ensure stores array exists before filtering
      const stores = b.stores || [];
      return sum + stores.filter(s => s.is_active).length;
    }, 0),
    monthlyGrowth: Math.round(monthlyGrowth * 10) / 10 // Round to 1 decimal place
  };
};