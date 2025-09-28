/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DiscountType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  business_id: string;
  store_id?: string;
  name: string;
  description?: string;
  discount_type_id: string;
  discount_value: number;
  minimum_purchase_amount?: number;
  maximum_discount_amount?: number;
  minimum_quantity?: number;
  maximum_quantity?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  customer_restrictions?: any;
  usage_limit?: number;
  usage_limit_per_customer: number;
  current_usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  discount_type?: DiscountType;
}

export interface Coupon {
  id: string;
  business_id: string;
  store_id?: string;
  code: string;
  name: string;
  description?: string;
  discount_type_id: string;
  discount_value: number;
  minimum_purchase_amount?: number;
  maximum_discount_amount?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  customer_restrictions?: any;
  usage_limit?: number;
  usage_limit_per_customer: number;
  current_usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  discount_type?: DiscountType;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  customer_id?: string;
  sale_id: string;
  discount_amount: number;
  used_at: string;
  created_at: string;
}

export interface PromotionUsage {
  id: string;
  promotion_id: string;
  customer_id?: string;
  sale_id: string;
  discount_amount: number;
  used_at: string;
  created_at: string;
}

export interface DiscountValidationResult {
  valid: boolean;
  error?: string;
  coupon_id?: string;
  promotion_id?: string;
  discount_amount?: number;
  discount_type?: string;
  discount_value?: number;
}

export interface ApplicablePromotion {
  id: string;
  name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  minimum_purchase_amount: number;
}

export interface DiscountApplication {
  type: 'coupon' | 'promotion';
  id: string;
  code?: string;
  name: string;
  discount_amount: number;
  discount_type: string;
  discount_value: number;
}

export interface CreatePromotionData {
  business_id: string;
  name: string;
  description?: string;
  discount_type_id: string;
  discount_value: number;
  minimum_purchase_amount?: number;
  maximum_discount_amount?: number;
  minimum_quantity?: number;
  maximum_quantity?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  customer_restrictions?: any;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  start_date: string;
  end_date: string;
  store_id?: string;
}

export interface CreateCouponData {
  business_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type_id: string;
  discount_value: number;
  minimum_purchase_amount?: number;
  maximum_discount_amount?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  customer_restrictions?: any;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  start_date: string;
  end_date: string;
  store_id?: string;
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> {
  id: string;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
  id: string;
}

export interface DiscountStats {
  total_discounts: number;
  total_discount_amount: number;
  coupon_usage_count: number;
  promotion_usage_count: number;
  most_used_coupon?: {
    id: string;
    code: string;
    name: string;
    usage_count: number;
  };
  most_used_promotion?: {
    id: string;
    name: string;
    usage_count: number;
  };
}
