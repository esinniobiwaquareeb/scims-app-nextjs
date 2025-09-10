'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck, Smartphone, Wallet } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  availableMethods: string[];
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  availableMethods,
  disabled = false
}: PaymentMethodSelectorProps) {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'pay_on_delivery':
        return <Truck className="w-5 h-5" />;
      case 'online_payment':
        return <CreditCard className="w-5 h-5" />;
      case 'mobile_money':
        return <Smartphone className="w-5 h-5" />;
      case 'digital_wallet':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'pay_on_delivery':
        return 'Pay on Delivery';
      case 'online_payment':
        return 'Online Payment';
      case 'mobile_money':
        return 'Mobile Money';
      case 'digital_wallet':
        return 'Digital Wallet';
      default:
        return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'pay_on_delivery':
        return 'Pay when your order is delivered';
      case 'online_payment':
        return 'Pay securely with your card';
      case 'mobile_money':
        return 'Pay with mobile money services';
      case 'digital_wallet':
        return 'Pay with digital wallet apps';
      default:
        return 'Payment method';
    }
  };

  if (availableMethods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Payment Method</Label>
      <RadioGroup
        value={selectedMethod}
        onValueChange={onMethodChange}
        disabled={disabled}
        className="space-y-2"
      >
        {availableMethods.map((method) => (
          <div key={method} className="relative">
            <RadioGroupItem
              value={method}
              id={method}
              className="peer sr-only"
            />
            <Label
              htmlFor={method}
              className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedMethod === method
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-primary">
                  {getMethodIcon(method)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {getMethodLabel(method)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getMethodDescription(method)}
                  </div>
                </div>
              </div>
              <div className={`w-4 h-4 border-2 rounded-full ${
                selectedMethod === method
                  ? 'border-primary bg-primary border-4 border-white shadow-sm'
                  : 'border-gray-300'
              }`} />
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
