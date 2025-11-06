'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  RefreshCcw,
  Plus,
  Search,
  Eye,
  Loader2,
  Package,
  DollarSign,
  ShoppingCart
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
        <Button onClick={() => setShowExchangeModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Exchange
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
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
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Exchange Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <DialogTitle>Transaction Details</DialogTitle>
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Transaction Number</Label>
                      <p className="font-mono font-semibold">{selectedTransaction.transaction_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Type</Label>
                      <div className="mt-1">{getTypeBadge(selectedTransaction.transaction_type)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <p>{formatDate(new Date(selectedTransaction.transaction_date))}</p>
                    </div>
                    {selectedTransaction.customer && (
                      <div>
                        <Label className="text-muted-foreground">Customer</Label>
                        <p className="font-medium">{selectedTransaction.customer.name}</p>
                        {selectedTransaction.customer.phone && (
                          <p className="text-sm text-muted-foreground">{selectedTransaction.customer.phone}</p>
                        )}
                      </div>
                    )}
                    {selectedTransaction.original_sale && (
                      <div>
                        <Label className="text-muted-foreground">Original Sale</Label>
                        <p className="font-mono text-sm">{selectedTransaction.original_sale.receipt_number}</p>
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
                      <Package className="h-4 w-4" />
                      Exchange Items ({selectedTransaction.exchange_items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTransaction.exchange_items.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold">
                                {item.product?.name || item.product_name || 'Unknown Product'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={CONDITION_OPTIONS.find(o => o.value === item.condition)?.color}>
                                  {item.condition}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × {formatCurrency(item.unit_value)} = {formatCurrency(item.total_value)}
                                </span>
                              </div>
                              {item.condition_notes && (
                                <p className="text-sm text-muted-foreground mt-1">{item.condition_notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total Trade-in Value:</span>
                          <span className="font-bold text-green-600">
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
                      <ShoppingCart className="h-4 w-4" />
                      Purchase Items ({selectedTransaction.purchase_items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTransaction.purchase_items.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg">
                          <p className="font-semibold">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Qty: {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}
                          </p>
                        </div>
                      ))}
                      <div className="pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total Purchase Amount:</span>
                          <span className="font-bold">
                            {formatCurrency(selectedTransaction.total_purchase_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Trade-in Value:</span>
                    <span className="font-semibold">{formatCurrency(selectedTransaction.trade_in_total_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Amount:</span>
                    <span className="font-semibold">{formatCurrency(selectedTransaction.total_purchase_amount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">Balance:</span>
                    <span className={`font-bold ${
                      selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {formatCurrency(
                        selectedTransaction.total_purchase_amount - selectedTransaction.trade_in_total_value
                      )}
                    </span>
                  </div>
                  {selectedTransaction.additional_payment > 0 && (
                    <div className="flex justify-between pt-2 border-t">
                      <span>Additional Payment:</span>
                      <span className="font-semibold">{formatCurrency(selectedTransaction.additional_payment)}</span>
                    </div>
                  )}
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
  { value: 'excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'damaged', color: 'bg-orange-100 text-orange-800' },
  { value: 'defective', color: 'bg-red-100 text-red-800' }
];

import { Label } from '@/components/ui/label';

