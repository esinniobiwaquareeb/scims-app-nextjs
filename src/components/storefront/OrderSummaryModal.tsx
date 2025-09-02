'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Mail, Phone, CheckCircle, Package, MessageCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface Business {
  name: string;
  phone: string;
  email: string;
  currency: { symbol: string; code: string };
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderNumber: string;
    business: Business;
    items: OrderItem[];
    customer: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
    };
    total: number;
    whatsappUrl: string;
    notes?: string;
  } | null;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
}

export default function OrderSummaryModal({
  isOpen,
  onClose,
  orderData,
  onDownloadPDF,
  isGeneratingPDF
}: OrderSummaryModalProps) {
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  // Automatically open WhatsApp when modal opens
  useEffect(() => {
    if (isOpen && orderData?.whatsappUrl && !whatsappOpened) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        try {
          window.open(orderData.whatsappUrl, '_blank');
          setWhatsappOpened(true);
        } catch (error) {
          console.error('Failed to open WhatsApp:', error);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, orderData?.whatsappUrl, whatsappOpened]);

  if (!orderData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Number */}
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Order #{orderData.orderNumber}
            </Badge>
          </div>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{orderData.business.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{orderData.business.phone}</span>
              </div>
              {orderData.business.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{orderData.business.email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Name:</strong> {orderData.customer.name}</div>
              <div><strong>Phone:</strong> {orderData.customer.phone}</div>
              {orderData.customer.email && (
                <div><strong>Email:</strong> {orderData.customer.email}</div>
              )}
              {orderData.customer.address && (
                <div><strong>Address:</strong> {orderData.customer.address}</div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderData.items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        {orderData.business.currency.symbol}{item.product.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold">
                      {orderData.business.currency.symbol}{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {orderData.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{orderData.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {orderData.business.currency.symbol}{orderData.total.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Action - Prominent */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Send Order to WhatsApp</span>
              </div>
              <p className="text-sm text-green-700">
                {whatsappOpened 
                  ? "WhatsApp should have opened automatically. If it didn't work, click the button below:"
                  : "WhatsApp will open automatically in a moment. If it doesn't, click the button below:"
                }
              </p>
              <Button
                onClick={() => {
                  window.open(orderData.whatsappUrl, '_blank');
                  setWhatsappOpened(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white w-full"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {whatsappOpened ? 'Open WhatsApp Again' : 'Open WhatsApp Now'}
              </Button>
            </div>
          </div>

          {/* Other Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download Receipt'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• WhatsApp should open automatically with your order details</li>
              <li>• Send the message to the business to confirm your order</li>
              <li>• The business will contact you to confirm payment and delivery</li>
              <li>• You can download your receipt as a PDF</li>
              {orderData.customer.email && (
                <li>• A confirmation email has been sent to your email address</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
