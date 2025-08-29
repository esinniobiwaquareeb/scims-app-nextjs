import { Sale, SalesStats } from '@/types/dashboard';

export function calculateSalesStats(sales: Sale[], searchTerm: string, dateFilter: string): SalesStats {
  if (!sales || sales.length === 0) {
    return {
      totalSales: 0,
      transactionCount: 0,
      averageTransaction: 0,
      cashTransactions: 0,
      cardTransactions: 0
    };
  }

  // Filter sales based on date filter
  const filteredSales = sales.filter(sale => {
    if (dateFilter === 'all') return true;
    
    const saleDate = new Date(sale.timestamp || sale.transaction_date || sale.created_at || new Date());
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch (dateFilter) {
      case 'today':
        return saleDate.toDateString() === today.toDateString();
      case 'yesterday':
        return saleDate.toDateString() === yesterday.toDateString();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return saleDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return saleDate >= monthAgo;
      default:
        return true;
    }
  });

  // Calculate stats
  const totalSales = filteredSales.reduce((sum, sale) => {
    return sum + (Number(sale.total_amount) || Number(sale.total) || 0);
  }, 0);

  const transactionCount = filteredSales.length;

  const averageTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

  const cashTransactions = filteredSales.filter(sale => 
    (sale.payment_method || sale.paymentMethod) === 'cash'
  ).length;

  const cardTransactions = filteredSales.filter(sale => 
    (sale.payment_method || sale.paymentMethod) !== 'cash'
  ).length;

  return {
    totalSales,
    transactionCount,
    averageTransaction,
    cashTransactions,
    cardTransactions
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDateTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTableDateTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getSessionDuration(loginTime: Date): string {
  const now = new Date();
  const diff = now.getTime() - loginTime.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
