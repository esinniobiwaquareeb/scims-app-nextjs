/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Receipt } from 'lucide-react';
import { Sale } from './types';

interface SaleDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onReprintReceipt: (receiptData: any) => void;
  formatCurrency: (amount: number) => string;
  formatDateTime: (date: Date) => string;
}

export const SaleDetailDialog: React.FC<SaleDetailDialogProps> = ({
  open,
  onOpenChange,
  sale,
  onReprintReceipt,
  formatCurrency,
  formatDateTime
}) => {
  if (!sale) return null;

  const handleReprintReceipt = () => {
    const receiptData = {
      storeName: '', // This should be passed from parent or context
      receiptNumber: sale.receipt_number,
      cashierName: '', // This should be passed from parent or context
      customerName: sale.customer_id && sale.customer_id !== 'walk-in' ? (sale.customer?.name || 'Customer') : 'Walk-in Customer',
      customerPhone: sale.customer_id && sale.customer_id !== 'walk-in' ? (sale.customer?.phone || '') : '',
      paymentMethod: sale.payment_method,
      items: sale.sale_items?.map(item => ({
        name: item.products?.name || 'Unknown Product',
        quantity: item.quantity || 0,
        price: item.unit_price || 0
      })) || [],
      itemCount: sale.sale_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
      subtotal: sale.subtotal || 0,
      tax: sale.tax_amount || 0,
      discount_amount: sale.discount_amount || 0,
      total: sale.total_amount || 0,
      cashAmount: sale.cash_received || 0,
      change: sale.change_given || 0,
      transactionDate: sale.transaction_date
    };
    onReprintReceipt(receiptData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
          <DialogDescription>
            Detailed information about this transaction.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Sale Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date & Time</p>
              <p className="font-medium">
                {formatDateTime(new Date(sale.transaction_date))}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">{sale.payment_method}</p>
            </div>
            {sale.customers?.name && sale.customers.name !== 'Walk-in Customer' && (
              <>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{sale.customers.name}</p>
                </div>
                {sale.customers.phone && (
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{sale.customers.phone}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Sale Items */}
          <div>
            <p className="font-medium mb-2">Items</p>
            <div className="space-y-2">
              {sale.sale_items && sale.sale_items.length > 0 ? (
                sale.sale_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p>{item.products?.name || 'Unknown Product'}</p>
                      <p className="text-muted-foreground">
                        {item.quantity || 0} × {formatCurrency(item.unit_price || 0)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.total_price || 0)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No items found</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Sale Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(sale.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(sale.total_amount)}</span>
            </div>
            {sale.payment_method === 'cash' && sale.cash_received && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Cash Received:</span>
                  <span>{formatCurrency(sale.cash_received)}</span>
                </div>
                {sale.change_given && sale.change_given > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Change Given:</span>
                    <span>{formatCurrency(sale.change_given)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Reprint Receipt */}
          <Button 
            onClick={handleReprintReceipt}
            className="w-full"
            variant="outline"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Reprint Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
