'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCcw,
  Plus,
  Search,
  Eye,
  Loader2,
  Package,
  DollarSign,
  ShoppingCart,
  Info,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import type { ExchangeTransaction, ExchangeTransactionFilters } from '@/types/exchange';
import { ExchangeModal } from './ExchangeModal';

export const ExchangeManagement: React.FC = () => {
  const { currentStore } = useAuth();
  const { formatCurrency, formatDate } = useSystem();

  const [transactions, setTransactions] = useState<ExchangeTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ExchangeTransaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!currentStore?.id) return;

    setLoading(true);
    try {
      const filters: ExchangeTransactionFilters = {
        store_id: currentStore.id,
        status: statusFilter !== 'all' ? statusFilter as ExchangeTransaction['status'] : undefined,
        transaction_type: typeFilter !== 'all' ? typeFilter as ExchangeTransaction['transaction_type'] : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      };

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/exchanges?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        let filtered = data.transactions || [];

        // Apply search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter((t: ExchangeTransaction) =>
            t.transaction_number.toLowerCase().includes(term) ||
            t.customer?.name.toLowerCase().includes(term) ||
            t.customer?.phone?.includes(term) ||
            t.original_sale?.receipt_number.toLowerCase().includes(term)
          );
        }

        setTransactions(filtered);
      } else {
        toast.error('Failed to fetch exchange transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch exchange transactions');
    } finally {
      setLoading(false);
    }
  }, [currentStore?.id, statusFilter, typeFilter, startDate, endDate, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch transaction details
  const fetchTransactionDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/exchanges/${id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedTransaction(data.transaction);
        setShowDetailModal(true);
      } else {
        toast.error('Failed to fetch transaction details');
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error('Failed to fetch transaction details');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      refunded: { variant: 'outline', label: 'Refunded' }
    };

    const config = variants[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      return: 'bg-blue-100 text-blue-800',
      trade_in: 'bg-green-100 text-green-800',
      exchange: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type === 'return' ? 'Return' : type === 'trade_in' ? 'Trade-in' : 'Exchange'}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Transaction #',
      accessor: 'transaction_number',
      cell: (transaction: ExchangeTransaction) => (
        <span className="font-mono text-sm">{transaction.transaction_number}</span>
      )
    },
    {
      header: 'Type',
      accessor: 'transaction_type',
      cell: (transaction: ExchangeTransaction) => getTypeBadge(transaction.transaction_type)
    },
    {
      header: 'Customer',
      accessor: 'customer',
      cell: (transaction: ExchangeTransaction) => (
        <div>
          {transaction.customer ? (
            <>
              <p className="font-medium text-sm">{transaction.customer.name}</p>
              {transaction.customer.phone && (
                <p className="text-xs text-muted-foreground">{transaction.customer.phone}</p>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">Walk-in</span>
          )}
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'transaction_date',
      cell: (transaction: ExchangeTransaction) => (
        <span className="text-sm">{formatDate(new Date(transaction.transaction_date))}</span>
      )
    },
    {
      header: 'Trade-in Value',
      accessor: 'trade_in_total_value',
      cell: (transaction: ExchangeTransaction) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(transaction.trade_in_total_value)}
        </span>
      )
    },
    {
      header: 'Purchase Amount',
      accessor: 'total_purchase_amount',
      cell: (transaction: ExchangeTransaction) => (
        <span className="font-semibold">
          {formatCurrency(transaction.total_purchase_amount)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (transaction: ExchangeTransaction) => getStatusBadge(transaction.status)
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (transaction: ExchangeTransaction) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchTransactionDetails(transaction.id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout
      title="Exchange & Trade-in Management"
      subtitle="Manage customer returns, trade-ins, and exchanges"
      headerActions={
        <Button onClick={() => setShowExchangeModal(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Guide:</strong> Returns require receipt validation. Trade-ins allow customers to bring items for credit. 
            Exchanges combine returns with new purchases. Click &quot;New Transaction&quot; to get started.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Transactions
            </CardTitle>
            <CardDescription>
              Search and filter exchange transactions by type, status, date, or customer
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by transaction #, customer, or receipt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="trade_in">Trade-in</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={fetchTransactions}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="start-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription className="mt-1">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              {transactions.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {transactions.filter(t => t.status === 'completed').length} Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No transactions found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new exchange transaction'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && !startDate && !endDate && (
                  <Button onClick={() => setShowExchangeModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Transaction
                  </Button>
                )}
              </div>
            ) : (
              <DataTable
                data={transactions}
                columns={columns}
                title="Exchange Transactions"
                emptyMessage="No exchange transactions found"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exchange Modal */}
      <ExchangeModal
        open={showExchangeModal}
        onOpenChange={setShowExchangeModal}
        onSuccess={() => {
          fetchTransactions();
          setShowExchangeModal(false);
        }}
      />

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" size="xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this exchange transaction
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedTransaction ? (
            <div className="space-y-6">
              {/* Transaction Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Information</CardTitle>
                  <CardDescription>Basic details about this transaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Transaction Number</Label>
                      <p className="font-mono font-semibold text-base mt-1">{selectedTransaction.transaction_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Transaction Type</Label>
                      <div className="mt-1">{getTypeBadge(selectedTransaction.transaction_type)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Date & Time</Label>
                      <p className="font-medium mt-1">{formatDate(new Date(selectedTransaction.transaction_date))}</p>
                    </div>
                    {selectedTransaction.customer && (
                      <div>
                        <Label className="text-muted-foreground text-xs">Customer</Label>
                        <p className="font-medium text-base mt-1">{selectedTransaction.customer.name}</p>
                        {selectedTransaction.customer.phone && (
                          <p className="text-sm text-muted-foreground mt-0.5">{selectedTransaction.customer.phone}</p>
                        )}
                      </div>
                    )}
                    {selectedTransaction.original_sale && (
                      <div>
                        <Label className="text-muted-foreground text-xs">Original Sale Receipt</Label>
                        <p className="font-mono text-sm font-semibold mt-1">{selectedTransaction.original_sale.receipt_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(new Date(selectedTransaction.original_sale.transaction_date))}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Exchange Items */}
              {selectedTransaction.exchange_items && selectedTransaction.exchange_items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Items Returned/Traded In
                      <Badge variant="secondary" className="ml-auto">
                        {selectedTransaction.exchange_items.length} item{selectedTransaction.exchange_items.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Items the customer returned or traded in during this transaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTransaction.exchange_items.map((item) => (
                        <div key={item.id} className="p-4 border-2 rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-base">
                                  {item.product?.name || item.product_name || 'Unknown Product'}
                                </p>
                                <Badge className={CONDITION_OPTIONS.find(o => o.value === item.condition)?.color}>
                                  {CONDITION_OPTIONS.find(o => o.value === item.condition)?.value === 'excellent' ? 'Excellent' :
                                   CONDITION_OPTIONS.find(o => o.value === item.condition)?.value === 'good' ? 'Good' :
                                   CONDITION_OPTIONS.find(o => o.value === item.condition)?.value === 'fair' ? 'Fair' :
                                   CONDITION_OPTIONS.find(o => o.value === item.condition)?.value === 'damaged' ? 'Damaged' :
                                   'Defective'}
                                </Badge>
                                {item.item_type === 'returned' && (
                                  <Badge variant="outline">Return</Badge>
                                )}
                                {item.item_type === 'trade_in' && (
                                  <Badge variant="outline">Trade-In</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">
                                  Quantity: <span className="font-medium text-foreground">{item.quantity}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Value: <span className="font-medium text-foreground">{formatCurrency(item.unit_value)}</span> each
                                </span>
                                <span className="font-semibold text-primary">
                                  Total: {formatCurrency(item.total_value)}
                                </span>
                              </div>
                              {item.condition_notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">"{item.condition_notes}"</p>
                              )}
                              {item.add_to_inventory !== false && (
                                <Badge variant="outline" className="mt-2 text-xs">Added to Inventory</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total Return/Trade-In Value:</span>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(selectedTransaction.trade_in_total_value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Items */}
              {selectedTransaction.purchase_items && selectedTransaction.purchase_items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      New Items Purchased
                      <Badge variant="secondary" className="ml-auto">
                        {selectedTransaction.purchase_items.length} item{selectedTransaction.purchase_items.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Items the customer purchased in this transaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTransaction.purchase_items.map((item) => (
                        <div key={item.id} className="p-4 border-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                          <p className="font-semibold text-base">{item.product?.name || 'Unknown Product'}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Quantity: <span className="font-medium text-foreground">{item.quantity}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Price: <span className="font-medium text-foreground">{formatCurrency(item.unit_price)}</span> each
                            </span>
                            <span className="font-semibold text-primary">
                              Total: {formatCurrency(item.total_price)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total Purchase Amount:</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(selectedTransaction.total_purchase_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <Card className="border-2 border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="h-6 w-6" />
                    Transaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                      <span className="text-base font-medium">Total Return/Trade-In Value:</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedTransaction.trade_in_total_value)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                      <span className="text-base font-medium">Total Purchase Amount:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(selectedTransaction.total_purchase_amount)}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                      selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value > 0
                        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        : selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value < 0
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        : 'bg-muted border-muted-foreground/20'
                    }`}>
                      <span className="text-lg font-semibold">
                        {selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value > 0
                          ? 'Customer Paid:'
                          : selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value < 0
                          ? 'Store Credit:'
                          : 'Balance:'
                        }
                      </span>
                      <span className={`text-2xl font-bold ${
                        selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value > 0
                          ? 'text-red-600 dark:text-red-400'
                          : selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value < 0
                          ? 'text-green-600 dark:text-green-400'
                          : ''
                      }`}>
                        {selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value > 0
                          ? `+${formatCurrency(selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value)}`
                          : formatCurrency(Math.abs(selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value))
                        }
                      </span>
                    </div>
                    {selectedTransaction.additional_payment > 0 && (
                      <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <span className="text-sm font-medium">Additional Payment Received:</span>
                        <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                          {formatCurrency(selectedTransaction.additional_payment)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedTransaction.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedTransaction.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Condition options for badge colors
const CONDITION_OPTIONS: { value: string; color: string }[] = [
  { value: 'excellent', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'good', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'fair', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'damaged', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'defective', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
];

