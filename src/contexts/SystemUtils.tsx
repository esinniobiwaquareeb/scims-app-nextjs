export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Date formatting moved to centralized utils/date-utils.ts
// Import from there instead: import { formatDate } from '../../utils/date-utils';

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const downloadCSV = (data: unknown[], filename: string): void => {
  if (!data.length) return;

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const csvContent = [
    headers.join(','),
    ...data.map((row: unknown) => 
      headers.map(header => {
        const value = (row as Record<string, unknown>)[header] as string;
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const SYSTEM_ROLES = {
  SUPERADMIN: 'superadmin',
  BUSINESS_ADMIN: 'business_admin',
  STORE_ADMIN: 'store_admin',
  CASHIER: 'cashier'
} as const;

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

export const SUBSCRIPTION_PLANS = {
  TRIAL: 'trial',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;