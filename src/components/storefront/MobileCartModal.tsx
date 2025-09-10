'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import StorefrontCart from './ShoppingCart';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
}

interface Business {
  id: string;
  name: string;
  currency: { symbol: string; code: string };
}

interface MobileCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  business: Business;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onOrder: () => void;
  isOrdering: boolean;
  orderSuccess: boolean;
  error: string;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  availablePaymentMethods: string[];
}

export default function MobileCartModal({
  isOpen,
  onClose,
  cart,
  business,
  onUpdateQuantity,
  onOrder,
  isOrdering,
  orderSuccess,
  error,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  customerAddress,
  setCustomerAddress,
  orderNotes,
  setOrderNotes,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  availablePaymentMethods
}: MobileCartModalProps) {
  const { isDark } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md mx-auto h-[90vh] flex flex-col p-0 ${
        isDark 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Shopping Cart ({cart.length})
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6">
            <StorefrontCart
              cart={cart}
              business={business}
              onUpdateQuantity={onUpdateQuantity}
              onOrder={onOrder}
              isOrdering={isOrdering}
              orderSuccess={orderSuccess}
              error={error}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              customerAddress={customerAddress}
              setCustomerAddress={setCustomerAddress}
              orderNotes={orderNotes}
              setOrderNotes={setOrderNotes}
              selectedPaymentMethod={selectedPaymentMethod}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
              availablePaymentMethods={availablePaymentMethods}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
