import React from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Timer,
  DollarSign,
  Receipt,
  BarChart3,
  History,
  Eye,
  Loader2
} from 'lucide-react';
import { Sale } from './types';

interface SalesHistoryProps {
  todaySales: Sale[];
  currentTime: Date;
  loginTime: Date;
  onRefreshSales: () => void;
  onSaleClick: (sale: Sale) => void;
  formatCurrency: (amount: number) => string;
  formatTime: (date: Date) => string;
  formatDateTime: (date: Date) => string;
  translate: (key: string, fallback?: string) => string;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  todaySales,
  currentTime,
  loginTime,
  onRefreshSales,
  onSaleClick,
  formatCurrency,
  formatTime,
  formatDateTime,
  translate
}) => {
  const getSessionDuration = () => {
    const duration = Math.floor((currentTime.getTime() - loginTime.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const todayStats = {
    totalSales: todaySales.reduce((sum, sale) => sum + sale.total_amount, 0),
    transactionCount: todaySales.length,
    averageTransaction: todaySales.length > 0 ? todaySales.reduce((sum, sale) => sum + sale.total_amount, 0) / todaySales.length : 0
  };

  return (
    <div className="p-4 space-y-6">
      {/* Current Time and Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{translate('pos.currentTime') || 'Current Time'}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{formatTime(currentTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{translate('pos.sessionTime') || 'Session Time'}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{getSessionDuration()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{translate('pos.totalSalesToday') || 'Total Sales Today'}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(todayStats.totalSales)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{translate('pos.transactionsToday') || 'Transactions Today'}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{todayStats.transactionCount}</p>
                </div>
              <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{translate('pos.averageTransaction') || 'Average Transaction'}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(todayStats.averageTransaction)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Sales
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefreshSales}
              className="text-xs border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Loader2 className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {todaySales.length > 0 ? (
            <ScrollArea className="h-96 max-h-[calc(100vh-400px)]">
              <div className="space-y-3 pr-4">
                {todaySales
                  .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                  .slice(0, 20)
                  .map(sale => (
                    <div 
                      key={sale.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-100 dark:border-gray-600"
                      onClick={() => onSaleClick(sale)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {sale.receipt_number || `Sale #${sale.id.slice(-6)}`}
                          </p>
                          <Badge 
                            variant={sale.payment_method === 'cash' ? 'default' : 'secondary'}
                            className="text-xs px-2 py-0.5"
                          >
                            {sale.payment_method}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {formatDateTime(new Date(sale.transaction_date))}
                        </p>
                        {sale.customer_name && sale.customer_name !== 'Walk-in Customer' && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Customer: {sale.customer_name}
                          </p>
                        )}
                        {sale.items && sale.items.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                          {formatCurrency(sale.total_amount)}
                        </p>
                        {sale.payment_method === 'cash' && sale.cash_received && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                            <div>Paid: {formatCurrency(sale.cash_received)}</div>
                            {sale.change_given && sale.change_given > 0 && (
                              <div>Change: {formatCurrency(sale.change_given)}</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No sales today</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Sales will appear here once transactions are completed</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
