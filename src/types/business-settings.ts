// ============================================================================
// BUSINESS SETTINGS SPECIFIC TYPES
// ============================================================================

import React from 'react';

// Business settings interface combining business and settings data
export interface BusinessSettings {
  // Business table fields
  name?: string;
  description?: string;
  industry?: string;
  timezone?: string;
  subscription_status?: string;
  subscription_expires_at?: string;
  is_active?: boolean;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  subscription_plan_id?: string;
  currency_id?: string;
  currency_code?: string;
  currency_name?: string;
  currency_symbol?: string;
  language_id?: string;
  language_code?: string;
  language_name?: string;
  language_native_name?: string;
  country_id?: string;
  business_type?: string;
  username?: string;
  slug?: string;
  
  // Business setting table fields
  taxRate: number;
  enableTax: boolean;
  discountRate: number;
  enableDiscount: boolean;
  allowReturns: boolean;
  returnPeriodDays: number;
  enableSounds: boolean;
  logo_url: string;
  receiptHeader: string;
  receiptFooter: string;
  returnPolicy: string;
  warrantyInfo: string;
  termsOfService: string;
  privacyPolicy: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  enable_stock_tracking?: boolean;
  enable_inventory_alerts?: boolean;
  enable_restock_management?: boolean;
  enable_recipe_management?: boolean;
  enable_service_booking?: boolean;
  enable_menu_management?: boolean;
  enable_ingredient_tracking?: boolean;
  enable_public_store?: boolean;
  store_theme?: string;
  store_banner_url?: string;
  store_description?: string;
  whatsapp_phone?: string;
  whatsapp_message_template?: string;
}

// Business settings component props
export interface BusinessSettingsProps {
  onBack: () => void;
}

// Business settings form data
export interface BusinessSettingsFormData {
  // Business basic info
  name: string;
  description: string;
  industry: string;
  timezone: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  business_type: string;
  username: string;
  slug: string;
  
  // Localization
  currency_id: string;
  language_id: string;
  country_id: string;
  
  // Business settings
  taxRate: number;
  enableTax: boolean;
  discountRate: number;
  enableDiscount: boolean;
  allowReturns: boolean;
  returnPeriodDays: number;
  enableSounds: boolean;
  logo_url: string;
  receiptHeader: string;
  receiptFooter: string;
  returnPolicy: string;
  warrantyInfo: string;
  termsOfService: string;
  privacyPolicy: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Feature flags
  enable_stock_tracking: boolean;
  enable_inventory_alerts: boolean;
  enable_restock_management: boolean;
  enable_recipe_management: boolean;
  enable_service_booking: boolean;
  enable_menu_management: boolean;
  enable_ingredient_tracking: boolean;
  enable_public_store: boolean;
  
  // Store customization
  store_theme: string;
  store_banner_url: string;
  store_description: string;
  whatsapp_phone: string;
  whatsapp_message_template: string;
}

// Business settings update data
export interface BusinessSettingsUpdateData {
  businessData?: Partial<BusinessSettingsFormData>;
  settingsData?: Partial<BusinessSettingsFormData>;
}

// Business settings validation errors
export interface BusinessSettingsValidationErrors {
  [key: string]: string | undefined;
}

// Business settings section configuration
export interface BusinessSettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  fields: BusinessSettingsField[];
}

// Business settings field configuration
export interface BusinessSettingsField {
  key: keyof BusinessSettingsFormData;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea' | 'select' | 'switch' | 'color' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

// Business settings theme configuration
export interface BusinessSettingsTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  store_theme: string;
}

// Business settings receipt configuration
export interface BusinessSettingsReceipt {
  header: string;
  footer: string;
  logo_url: string;
  returnPolicy: string;
  warrantyInfo: string;
}

// Business settings feature flags
export interface BusinessSettingsFeatures {
  enable_stock_tracking: boolean;
  enable_inventory_alerts: boolean;
  enable_restock_management: boolean;
  enable_recipe_management: boolean;
  enable_service_booking: boolean;
  enable_menu_management: boolean;
  enable_ingredient_tracking: boolean;
  enable_public_store: boolean;
}

// Business settings integration configuration
export interface BusinessSettingsIntegration {
  whatsapp_phone: string;
  whatsapp_message_template: string;
}

// Business settings statistics
export interface BusinessSettingsStats {
  totalSettings: number;
  lastUpdated: string;
  settingsVersion: string;
}
