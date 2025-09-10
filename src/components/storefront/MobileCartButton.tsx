'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface MobileCartButtonProps {
  cartCount: number;
  onClick: () => void;
}

export default function MobileCartButton({ cartCount, onClick }: MobileCartButtonProps) {
  const { isDark } = useTheme();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 lg:hidden">
      <Button
        onClick={onClick}
        size="lg"
        className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          isDark
            ? 'bg-brand-primary hover:bg-brand-primary/90 text-white'
            : 'bg-brand-primary hover:bg-brand-primary/90 text-white'
        }`}
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <Badge
            className={`absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isDark
                ? 'bg-red-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        </div>
      </Button>
    </div>
  );
}
