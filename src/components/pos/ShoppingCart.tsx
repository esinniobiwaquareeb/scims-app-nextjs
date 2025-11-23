/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { PaymentModal } from './PaymentModal';
import { DiscountApplicationComponent } from '@/components/DiscountApplication';
import {  
  Minus, 
  Plus, 
  Trash2, 
  CreditCard,
  Search,
  Receipt,
  Save,
  Clock,
  ShoppingCart as ShoppingCartIcon
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  barcode?: string;
  description?: string;
  stock_quantity: number;
  category_id?: string;
  categories?: { id: string; name: string };
  is_active: boolean;
  image_url?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount_amount?: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

interface ShoppingCartProps {
  cart?: CartItem[];
  selectedCustomer: Customer;
  paymentMethod: 'cash' | 'card' | 'mixed';
  cashAmount: string;
  cardAmount: string;
  deliveryCost?: string;
  isProcessing: boolean;
  showSaleSuccess: boolean;
  lastSaleInfo: any;
  cartSearchTerm: string;
  isSupplyMode?: boolean;
  allowVariablePricing?: boolean;
  businessId?: string;
  storeId?: string;
  appliedDiscount?: any;
  onCartSearchChange: (term: string) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onPaymentMethodChange: (method: 'cash' | 'card' | 'mixed') => void;
  onCashAmountChange: (amount: string) => void;
  onCardAmountChange: (amount: string) => void;
  onDeliveryCostChange?: (amount: string) => void;
  onProcessPayment: (onComplete?: () => void) => void;
  onSaveCart: () => void;
  onLoadSavedCarts: () => void;
  onSelectCustomer: () => void;
  onClearCustomer: () => void;
  onDiscountApplied: (discount: any) => void;
  onClearDiscount?: () => void;
  calculateSubtotal: () => number;
  calculateDiscount: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  getChange: () => number;
  isValidCashAmount: (cashAmount: string, total: number) => boolean;
  formatCurrency: (amount: number) => string;
  translate: (key: string, fallback?: string) => string;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart = [],
  selectedCustomer = {
    id: 'walk-in',
    name: 'Walk-in Customer',
    phone: '',
    email: '',
    created_at: new Date().toISOString()
  },
  paymentMethod,
  cashAmount,
  cardAmount,
  deliveryCost = '0',
  isProcessing,
  showSaleSuccess,
  lastSaleInfo,
  cartSearchTerm,
  isSupplyMode = false,
  allowVariablePricing = false,
  businessId,
  storeId,
  appliedDiscount,
  onCartSearchChange,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onPaymentMethodChange,
  onCashAmountChange,
  onCardAmountChange,
  onDeliveryCostChange,
  onProcessPayment,
  onSaveCart,
  onLoadSavedCarts,
  onSelectCustomer,
  onClearCustomer,
  onDiscountApplied,
  onClearDiscount,
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  getChange,
  isValidCashAmount,
  formatCurrency,
  translate
}) => {
  const filteredCartItems = (cart || []).filter(item => {
    if (!cartSearchTerm?.trim()) return true;
    const searchLower = cartSearchTerm.toLowerCase();
    return item.product?.name?.toLowerCase().includes(searchLower) ||
           item.product?.sku?.toLowerCase().includes(searchLower) ||
           item.product?.description?.toLowerCase().includes(searchLower);
  });

  const hasItems = (cart || []).length > 0;
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="w-full lg:w-96 xl:w-[420px] flex flex-col space-y-2 sm:space-y-3 h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] lg:h-[calc(100vh-100px)]">
      {/* Compact Cart Header with Actions */}
      <Card className="flex-shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-2 sm:p-2.5 md:p-3">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShoppingCartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
              <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100">{translate('pos.cart') || 'Cart'} ({(cart || []).length})</span>
            </div>
            {hasItems && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-2 border-red-200 rounded-lg h-7 w-7 sm:h-8 sm:w-8 p-0 transition-all duration-200 touch-manipulation"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
          
          {/* Cart Actions Row */}
          <div className="flex gap-2 sm:gap-3">
            {/* Save button - only show when there are items to save */}
            {hasItems && (
              <Button 
                onClick={onSaveCart}
                variant="outline"
                size="sm"
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-all duration-200 touch-manipulation"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            )}
            {/* Load button - always show so cashiers can load saved carts */}
            <Button 
              onClick={onLoadSavedCarts}
              variant="outline"
              size="sm"
              className={`h-8 sm:h-9 text-xs sm:text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-all duration-200 touch-manipulation ${
                hasItems ? 'flex-1' : 'w-full'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Load</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 
        CUSTOMER SELECTION MOVED TO PAYMENT MODAL
        ============================================================================
        Customer selection has been moved to the PaymentModal to save space in the main cart view.
        This makes more sense since customer selection is most relevant during payment processing.
        The customer info is still accessible when needed but doesn't take up permanent space.
      */}

      {/* Cart Items - Optimized for space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-full">
              <div className="p-3">
                {!hasItems ? (
                  <div className="text-center py-4">
                    {showSaleSuccess && lastSaleInfo ? (
                      <>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Receipt className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-green-800 font-medium text-xs mb-1">Sale Completed!</p>
                        <p className="text-xs text-green-700 mb-1">
                          #{lastSaleInfo.receiptNumber} • {formatCurrency(lastSaleInfo.total)}
                        </p>
                        <p className="text-muted-foreground text-xs">Ready for next transaction</p>
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-muted-foreground text-xs mb-1">{translate('pos.cartEmpty') || 'Cart is empty'}</p>
                        <p className="text-xs text-muted-foreground">{translate('pos.touchProductsToAdd') || 'Touch products to add them'}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Compact Cart Search */}
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <Input
                        placeholder="Search cart..."
                        value={cartSearchTerm}
                        onChange={(e) => onCartSearchChange(e.target.value)}
                        className="pl-6 h-7 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      {cartSearchTerm && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCartSearchChange('')}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>

                    {/* Compact Cart Items List */}
                    {filteredCartItems.length === 0 ? (
                      <div className="text-center py-2">
                        <p className="text-xs text-muted-foreground">No items match your search</p>
                      </div>
                    ) : (
                      filteredCartItems.map(item => (
                        <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                          <div className="w-10 h-10 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                            <ImageWithFallback
                              src={item.product.image_url || undefined}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1 leading-tight text-gray-900">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-600 font-medium">
                              {formatCurrency(item.product.price)} × {item.quantity}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => onUpdateQuantity(item.product.id, -1)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1">
                                {item.quantity}
                              </span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => onUpdateQuantity(item.product.id, 1)}
                                disabled={item.quantity >= item.product.stock_quantity}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => onRemoveFromCart(item.product.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-2 border-red-200 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Search Results Summary */}
                    {cartSearchTerm && filteredCartItems.length !== (cart || []).length && (
                      <div className="text-center py-2 text-xs text-muted-foreground border-t">
                        Showing {filteredCartItems.length} of {(cart || []).length} items
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Compact Payment Section - Only show when items exist */}
      {hasItems && (
        <Card className="flex-shrink-0 border-t-2 border-gray-200 dark:border-gray-700">
          <CardContent className="p-2 sm:p-2.5 md:p-3">
            <div className="space-y-2 sm:space-y-2.5">
              {/* Sale Success Indicator - Compact */}
              {showSaleSuccess && lastSaleInfo && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-1.5 sm:p-2 mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-green-800 dark:text-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-[10px] sm:text-xs">Previous Sale: #{lastSaleInfo.receiptNumber}</span>
                  </div>
                </div>
              )}
              
              {/* Discount Application */}
              {businessId && (
                <DiscountApplicationComponent
                  businessId={businessId}
                  storeId={storeId}
                  customerId={selectedCustomer?.id !== 'walk-in' ? selectedCustomer?.id : undefined}
                  subtotal={calculateSubtotal()}
                  productIds={cart?.map(item => item.product.id)}
                  onDiscountApplied={onDiscountApplied}
                  appliedDiscount={appliedDiscount}
                  className="mb-2 sm:mb-3"
                />
              )}

              {/* Compact Order Summary */}
              <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium">-{formatCurrency(calculateDiscount())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">{formatCurrency(calculateTax())}</span>
                </div>
                <Separator className="my-1 sm:my-1.5" />
                <div className="flex justify-between items-center font-semibold text-xs sm:text-sm pt-1">
                  <span>Total:</span>
                  <span className="text-sm sm:text-base md:text-lg text-green-700 dark:text-green-400">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              {/* Process Payment Button - Opens Modal */}
              <div className="pt-2 sm:pt-3 pb-1">
                <Button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm font-semibold touch-manipulation"
                  size="sm"
                  disabled={(cart || []).length === 0}
                >
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {isSupplyMode ? 'Process Supply Order' : (translate('pos.processPayment') || 'Process Payment')}
                </Button>
                {/* Supply Mode Warning */}
                {isSupplyMode && selectedCustomer?.id === 'walk-in' && (cart || []).length > 0 && (
                  <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 text-center mt-1.5 sm:mt-2 font-medium">
                    Please select a registered customer to process supply order
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 
        ORIGINAL INLINE PAYMENT SECTION - COMMENTED OUT FOR MODAL VERSION
        ============================================================================
        To revert to inline payment, comment out the modal version above and uncomment this section.
        Also remove the PaymentModal import and state, and remove the modal component below.
      */}
      {/*
      {hasItems && (
        <Card className="flex-shrink-0">
          <CardContent className="p-3">
            <div className="space-y-3">
              // ... original payment section would go here ...
            </div>
          </CardContent>
        </Card>
      )}
      */}

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={(open) => {
          setShowPaymentModal(open);
          // Clear discounts when modal is closed without processing payment
          if (!open && !showSaleSuccess && onClearDiscount) {
            onClearDiscount();
          }
        }}
        selectedCustomer={selectedCustomer}
        paymentMethod={paymentMethod}
        cashAmount={cashAmount}
        cardAmount={cardAmount}
        deliveryCost={deliveryCost}
        isProcessing={isProcessing}
        showSaleSuccess={showSaleSuccess}
        lastSaleInfo={lastSaleInfo}
        isSupplyMode={isSupplyMode}
        allowVariablePricing={allowVariablePricing}
        onSelectCustomer={onSelectCustomer}
        onClearCustomer={onClearCustomer}
        onPaymentMethodChange={onPaymentMethodChange}
        onCashAmountChange={onCashAmountChange}
        onCardAmountChange={onCardAmountChange}
        onDeliveryCostChange={onDeliveryCostChange}
        onProcessPayment={() => {
          // Pass callback to close modal only after payment processing and printing is complete
          onProcessPayment(() => {
            setShowPaymentModal(false);
          });
        }}
        calculateSubtotal={calculateSubtotal}
        calculateTax={calculateTax}
        calculateTotal={calculateTotal}
        getChange={getChange}
        isValidCashAmount={isValidCashAmount}
        formatCurrency={formatCurrency}
        translate={translate}
      />
    </div>
  );
};
