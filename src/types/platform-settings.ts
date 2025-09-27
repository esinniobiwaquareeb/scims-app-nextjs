// ============================================================================
// PLATFORM SETTINGS SPECIFIC TYPES
// ============================================================================

import React from 'react';

// Platform settings component props
export interface PlatformSettingsProps {
  onBack: () => void;
}

// Platform settings data interface
export interface PlatformSettingsData {
  platform_name: string;
  platform_version: string;
  default_currency: string;
  default_language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  demo_mode: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  allow_username_login: boolean;
  require_email_verification: boolean;
  session_timeout: number;
  max_login_attempts: number;
  platform_phone?: string;
  platform_whatsapp?: string;
  platform_email?: string;
  platform_website?: string;
  enable_pay_on_delivery?: boolean;
  enable_online_payment?: boolean;
  payment_methods?: string[];
  supported_currencies: Currency[];
  supported_languages: Language[];
}

// Currency interface for platform settings
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Language interface for platform settings
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

// System health interface
export interface SystemHealth {
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  services: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'outage' | 'maintenance';
    responseTime?: number;
    lastCheck: string;
  }>;
  uptime: number;
  lastHealthCheck: string;
}

// Platform settings form data
export interface PlatformSettingsFormData {
  platform_name: string;
  default_currency: string;
  default_language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  demo_mode: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  allow_username_login: boolean;
  require_email_verification: boolean;
  session_timeout: number;
  max_login_attempts: number;
  platform_phone?: string;
  platform_whatsapp?: string;
  platform_email?: string;
  platform_website?: string;
  enable_pay_on_delivery?: boolean;
  enable_online_payment?: boolean;
  payment_methods?: string[];
}

// Platform settings validation errors
export interface PlatformSettingsValidationErrors {
  platform_name?: string;
  default_currency?: string;
  default_language?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  session_timeout?: string;
  max_login_attempts?: string;
  platform_phone?: string;
  platform_whatsapp?: string;
  platform_email?: string;
  platform_website?: string;
  maintenance_message?: string;
}

// Platform settings section
export interface PlatformSettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ElementType;
}

// Platform settings field
export interface PlatformSettingsField {
  id: keyof PlatformSettingsFormData;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'select' | 'textarea' | 'switch' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  category?: string; // e.g., 'general', 'security', 'payment', 'maintenance'
}

// Platform settings tab
export interface PlatformSettingsTab {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ElementType;
}

// Platform settings stats
export interface PlatformSettingsStats {
  totalBusinesses: number;
  activeBusinesses: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  systemUptime: number;
  lastBackup: string;
}

// Platform settings export options
export interface PlatformSettingsExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeSettings?: boolean;
  includeHealth?: boolean;
  includeStats?: boolean;
}

// Platform settings backup options
export interface PlatformSettingsBackupOptions {
  includeDatabase: boolean;
  includeFiles: boolean;
  includeSettings: boolean;
  compression: 'none' | 'gzip' | 'zip';
}

// Platform settings restore options
export interface PlatformSettingsRestoreOptions {
  backupFile: File;
  restoreDatabase: boolean;
  restoreFiles: boolean;
  restoreSettings: boolean;
}

// Platform settings maintenance mode
export interface PlatformMaintenanceMode {
  enabled: boolean;
  message: string;
  allowedIPs: string[];
  startTime?: string;
  endTime?: string;
}

// Platform settings security
export interface PlatformSecuritySettings {
  requireEmailVerification: boolean;
  allowUsernameLogin: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableTwoFactor: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
}

// Platform settings payment
export interface PlatformPaymentSettings {
  enablePayOnDelivery: boolean;
  enableOnlinePayment: boolean;
  paymentMethods: string[];
  supportedCurrencies: string[];
  defaultCurrency: string;
  transactionFee: number;
}

// Platform settings notification
export interface PlatformNotificationSettings {
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePushNotifications: boolean;
  notificationEmail: string;
  smsProvider: string;
  pushService: string;
}

// Platform settings integration
export interface PlatformIntegrationSettings {
  enableAPIAccess: boolean;
  apiRateLimit: number;
  enableWebhooks: boolean;
  webhookSecret: string;
  enableAnalytics: boolean;
  analyticsProvider: string;
}

// Platform settings theme
export interface PlatformThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  customCSS: string;
}

// Platform settings localization
export interface PlatformLocalizationSettings {
  defaultLanguage: string;
  supportedLanguages: string[];
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  currencyFormat: string;
  numberFormat: string;
}
