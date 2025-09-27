// ============================================================================
// POS COMPONENT TYPES
// ============================================================================
// This file re-exports types from the centralized types location
// to maintain backward compatibility with existing POS components

import { Product, CartItem, Customer, Sale } from '@/types';

// Re-export core types from centralized location
export type { Product, CartItem, Customer, Sale };

// POS-specific extended types
export interface POSProduct extends Product {
  categories?: { id: string; name: string };
}

export interface POSCartItem extends CartItem {
  product: POSProduct;
  discount_amount?: number;
}

export interface POSSale extends Sale {
  customer_name?: string;
  customer_phone?: string;
  sale_items?: Array<{
    quantity: number;
    unit_price: number;
    total_price: number;
    products?: {
      name: string;
    };
  }>;
  customers?: {
    name: string;
    phone: string;
  };
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
}