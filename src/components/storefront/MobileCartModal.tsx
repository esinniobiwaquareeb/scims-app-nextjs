'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus,
  Minus,
  CheckCircle,
  Loader2,
  Package
} from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';

interface Product {
  id: string;
  name: string;
  description: string;
  public_description?: string;
  price: number;
  image_url?: string;
  public_images?: string[];
  category?: { name: string };
  brand?: { name: string };
  store?: { name: string };
  stock_quantity: number;
  created_at: string;
}

interface CartItem {
  product: Product;
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

interface MobileCartContentProps {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-auto h-[90vh] max-h-[90vh] flex flex-col rounded-lg shadow-lg border ${
        isDark 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Shopping Cart ({cart.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              <MobileCartContent
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
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized cart content without Card wrapper
function MobileCartContent({
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
}: MobileCartContentProps) {
  const { isDark } = useTheme();
  
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <div className="space-y-4">
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <Package className={`w-12 h-12 mx-auto mb-3 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <p className={`${
            isDark ? 'text-gray-300' : 'text-gray-500'
          }`}>
            Your cart is empty
          </p>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-gray-400' : 'text-gray-400'
          }`}>
            Add some products to get started
          </p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.product.name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {business?.currency?.symbol}{item.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className={`h-8 w-8 ${
                      isDark
                        ? 'bg-gray-600 hover:bg-gray-500 border-gray-500 text-white'
                        : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className={`h-8 w-8 ${
                      isDark
                        ? 'bg-gray-600 hover:bg-gray-500 border-gray-500 text-white'
                        : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subtotal:</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {business?.currency?.symbol}{getCartTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg">
              <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Total:</span>
              <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                {business?.currency?.symbol}{getCartTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="customerName" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Phone *</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Your phone number"
                  className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}
                />
              </div>
              <div>
                <Label htmlFor="customerEmail" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}
                />
              </div>
              <div>
                <Label htmlFor="customerAddress" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Address</Label>
                <Textarea
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Delivery address"
                  rows={3}
                  className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}
                />
              </div>
              <div>
                <Label htmlFor="orderNotes" className={isDark ? 'text-gray-300' : 'text-gray-700'}>Notes</Label>
                <Textarea
                  id="orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special instructions"
                  rows={3}
                  className={isDark ? 'bg-gray-800 border-gray-600 text-white' : ''}
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
            availableMethods={availablePaymentMethods}
          />

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}

          {orderSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Order placed successfully! You will receive a confirmation shortly.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={onOrder}
            disabled={isOrdering || cart.length === 0 || !customerName || !customerPhone}
            className="w-full py-3 text-lg"
          >
            {isOrdering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order${selectedPaymentMethod === 'pay_on_delivery' ? ' (Pay on Delivery)' : ''}`
            )}
          </Button>
        </>
      )}
    </div>
  );
}
