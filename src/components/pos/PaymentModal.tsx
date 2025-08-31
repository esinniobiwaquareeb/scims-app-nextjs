/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// PAYMENT MODAL - COMMENT OUT THIS ENTIRE FILE TO REVERT TO INLINE PAYMENT
// ============================================================================
// To revert: 
// 1. Comment out this entire file content
// 2. In ShoppingCart.tsx, replace the simplified payment section with the original
// 3. Remove the PaymentModal import and state
// ============================================================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { 
  CreditCard, 
  DollarSign, 
  Loader2,
  Receipt,
  X,
  User
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: Customer;
  paymentMethod: 'cash' | 'card' | 'mixed';
  cashAmount: string;
  cardAmount: string;
  isProcessing: boolean;
  showSaleSuccess: boolean;
  lastSaleInfo: any;
  onSelectCustomer: () => void;
  onClearCustomer: () => void;
  onPaymentMethodChange: (method: 'cash' | 'card' | 'mixed') => void;
  onCashAmountChange: (amount: string) => void;
  onCardAmountChange: (amount: string) => void;
  onProcessPayment: () => void;
  calculateSubtotal: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  getChange: () => number;
  isValidCashAmount: (cashAmount: string, total: number) => boolean;
  formatCurrency: (amount: number) => string;
  translate: (key: string, fallback?: string) => string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  selectedCustomer,
  paymentMethod,
  cashAmount,
  cardAmount,
  isProcessing,
  showSaleSuccess,
  lastSaleInfo,
  onSelectCustomer,
  onClearCustomer,
  onPaymentMethodChange,
  onCashAmountChange,
  onCardAmountChange,
  onProcessPayment,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  getChange,
  isValidCashAmount,
  formatCurrency,
  translate
}) => {
  // Auto-set card amount to total when modal opens with card payment selected
  React.useEffect(() => {
    if (open && paymentMethod === 'card' && (!cardAmount || Math.abs(parseFloat(cardAmount) - calculateTotal()) > 0.01)) {
      onCardAmountChange(calculateTotal().toFixed(2));
    }
  }, [open, paymentMethod, cardAmount, calculateTotal, onCardAmountChange]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Receipt className="w-5 h-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Customer Selection - Moved from main cart for better space utilization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Customer</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={onSelectCustomer}
                className="h-7 px-2 text-xs border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <User className="w-3 h-3 mr-1" />
                Select
              </Button>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                  {selectedCustomer?.id === 'walk-in' ? 'Walk-in Customer' : (selectedCustomer?.name || 'Walk-in Customer')}
                </p>
                {selectedCustomer?.phone && selectedCustomer.id !== 'walk-in' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedCustomer.phone}</p>
                )}
              </div>
              {selectedCustomer?.id !== 'walk-in' && (
                <Button size="sm" variant="ghost" onClick={onClearCustomer} className="h-6 w-6 p-0 ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Sale Success Indicator */}
          {showSaleSuccess && lastSaleInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-sm">Previous Sale Completed!</span>
              </div>
              <div className="text-xs text-green-700 mt-1">
                Receipt #{lastSaleInfo.receiptNumber} • {formatCurrency(lastSaleInfo.total)}
              </div>
            </div>
          )}
          
          {/* Order Summary */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total:</span>
                <span className="text-lg">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{translate('pos.paymentMethod') || 'Payment Method'}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button 
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => onPaymentMethodChange('cash')}
                size="sm"
                className="h-10 text-sm"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Cash
              </Button>
              <Button 
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => {
                  onPaymentMethodChange('card');
                  // Auto-set card amount to total when card is selected
                  onCardAmountChange(calculateTotal().toFixed(2));
                }}
                size="sm"
                className="h-10 text-sm"
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Card
              </Button>
              <Button 
                variant={paymentMethod === 'mixed' ? 'default' : 'outline'}
                onClick={() => onPaymentMethodChange('mixed')}
                size="sm"
                className="h-10 text-sm"
              >
                Mixed
              </Button>
            </div>
          </div>

          {/* Payment Inputs */}
          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">{translate('pos.cardAmount') || 'Card Amount'}</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cardAmount}
                onChange={(e) => onCardAmountChange(e.target.value)}
                onBlur={(e) => {
                  // Format to 2 decimal places on blur
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    onCardAmountChange(value.toFixed(2));
                  }
                }}
                className="text-center font-mono h-12 text-lg font-semibold border-2 border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-blue-50"
              />
              {cardAmount && (
                <div className={`text-sm p-3 rounded-lg text-center ${
                  Math.abs(parseFloat(cardAmount) - calculateTotal()) <= 0.01
                    ? 'text-green-700 bg-green-50 border border-green-200'
                    : 'text-red-700 bg-red-50 border border-red-200'
                }`}>
                  {formatCurrency(parseFloat(cardAmount) || 0)} / {formatCurrency(calculateTotal())}
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div className="text-center">
                <Label className="text-sm font-semibold text-green-700">{translate('pos.cashAmount') || 'CASH RECEIVED'}</Label>
              </div>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashAmount}
                onChange={(e) => onCashAmountChange(e.target.value)}
                onBlur={(e) => {
                  // Format to 2 decimal places on blur
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    onCashAmountChange(value.toFixed(2));
                  }
                }}
                className="text-center font-mono h-12 text-lg font-bold border-2 border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
              />
              {cashAmount && (
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700">
                    Change: {formatCurrency(getChange())}
                  </div>
                  {getChange() > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      💰 Ready to give {formatCurrency(getChange())} back
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'mixed' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-green-700 text-center block mb-2">CASH</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cashAmount}
                    onChange={(e) => {
                      const cashValue = e.target.value;
                      onCashAmountChange(cashValue);
                      if (cashValue && parseFloat(cashValue) < calculateTotal()) {
                        const remaining = calculateTotal() - parseFloat(cashValue);
                        onCardAmountChange(remaining.toFixed(2));
                      } else if (cashValue && parseFloat(cashValue) >= calculateTotal()) {
                        onCardAmountChange('0.00');
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure the combined amount equals total on blur
                      const cashValue = parseFloat(e.target.value) || 0;
                      if (cashValue > 0 && cashValue < calculateTotal()) {
                        const remaining = calculateTotal() - cashValue;
                        onCardAmountChange(remaining.toFixed(2));
                      }
                      // Format to 2 decimal places
                      if (!isNaN(cashValue)) {
                        onCashAmountChange(cashValue.toFixed(2));
                      }
                    }}
                    className="text-center font-mono h-10 text-base font-semibold border-2 border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-blue-700 text-center block mb-2">CARD</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cardAmount}
                    onChange={(e) => {
                      const cardValue = e.target.value;
                      onCardAmountChange(cardValue);
                      if (cardValue && parseFloat(cardValue) < calculateTotal()) {
                        const remaining = calculateTotal() - parseFloat(cardValue);
                        onCashAmountChange(remaining.toFixed(2));
                      } else if (cardValue && parseFloat(cardValue) >= calculateTotal()) {
                        onCashAmountChange('0.00');
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure the combined amount equals total on blur
                      const cardValue = parseFloat(e.target.value) || 0;
                      if (cardValue > 0 && cardValue < calculateTotal()) {
                        const remaining = calculateTotal() - cardValue;
                        onCashAmountChange(remaining.toFixed(2));
                      }
                      // Format to 2 decimal places
                      if (!isNaN(cardValue)) {
                        onCardAmountChange(cardValue.toFixed(2));
                      }
                    }}
                    className="text-center font-mono h-10 text-base font-semibold border-2 border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-blue-50"
                  />
                </div>
              </div>
              <div className={`text-sm font-medium text-center p-3 rounded-lg ${
                Math.abs((parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0) - calculateTotal()) <= 0.01
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Combined Total: {formatCurrency((parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0))}
                {Math.abs((parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0) - calculateTotal()) > 0.01 && (
                  <div className="text-xs mt-1">
                    {formatCurrency((parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0))} / {formatCurrency(calculateTotal())}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Validation Errors */}
          <div className="space-y-2">
            {paymentMethod === 'cash' && cashAmount && !isValidCashAmount(cashAmount, calculateTotal()) && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                Cash amount must be ≥ total
              </div>
            )}
            {paymentMethod === 'card' && cardAmount && Math.abs(parseFloat(cardAmount) - calculateTotal()) > 0.01 && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                Card amount must equal total
              </div>
            )}
            {paymentMethod === 'mixed' && cashAmount && cardAmount && Math.abs((parseFloat(cashAmount) + parseFloat(cardAmount)) - calculateTotal()) > 0.01 && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                Combined amount must equal total
              </div>
            )}
          </div>

          {/* Process Payment Button */}
          <div className="pt-2">
            <Button 
              onClick={onProcessPayment}
              className="w-full"
              size="lg"
              disabled={
                isProcessing ||
                (paymentMethod === 'cash' && !isValidCashAmount(cashAmount, calculateTotal())) ||
                (paymentMethod === 'card' && (!cardAmount || Math.abs(parseFloat(cardAmount) - calculateTotal()) > 0.01)) ||
                (paymentMethod === 'mixed' && (!cashAmount || !cardAmount || Math.abs((parseFloat(cashAmount) + parseFloat(cardAmount)) - calculateTotal()) > 0.01))
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {translate('pos.processing') || 'Processing...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {translate('pos.processPayment') || 'Process Payment'}
                </>
              )}
            </Button>
            {isProcessing && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Processing payment and printing receipt...
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
