// ============================================================================
// PUBLIC ORDER RELATED TYPES
// ============================================================================

export interface PublicOrder {
  id: string;
  business_id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  order_items: PublicOrderItem[];
  subtotal: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  payment_method?: string;
  whatsapp_sent?: boolean;
  whatsapp_message_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}
