// Activity Types - Main categories of activities
export const ACTIVITY_TYPES = {
  // Authentication & User Management
  AUTH: 'auth',
  USER: 'user',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Business Operations
  BUSINESS: 'business',
  STORE: 'store',
  PRODUCT: 'product',
  INVENTORY: 'inventory',
  SALE: 'sale',
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  
  // Financial Operations
  PAYMENT: 'payment',
  REFUND: 'refund',
  EXPENSE: 'expense',
  
  // System Operations
  SYSTEM: 'system',
  SETTINGS: 'settings',
  MAINTENANCE: 'maintenance',
  
  // Security
  SECURITY: 'security',
  PERMISSION: 'permission',
  ROLE: 'role',
  
  // Data Operations
  IMPORT: 'import',
  EXPORT: 'export',
  SYNC: 'sync',
  
  // Communication
  NOTIFICATION: 'notification',
  EMAIL: 'email',
  SMS: 'sms',
  
  // Reporting
  REPORT: 'report',
  ANALYTICS: 'analytics',
  AUDIT: 'audit'
} as const;

// Activity Categories - Specific subcategories
export const ACTIVITY_CATEGORIES = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // User Management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ACTIVATED: 'user_activated',
  USER_DEACTIVATED: 'user_deactivated',
  
  // Business Management
  BUSINESS_CREATED: 'business_created',
  BUSINESS_UPDATED: 'business_updated',
  BUSINESS_DELETED: 'business_deleted',
  BUSINESS_SETTINGS_UPDATED: 'business_settings_updated',
  
  // Store Management
  STORE_CREATED: 'store_created',
  STORE_UPDATED: 'store_updated',
  STORE_DELETED: 'store_deleted',
  STORE_SETTINGS_UPDATED: 'store_settings_updated',
  
  // Product Management
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  PRODUCT_IMPORTED: 'product_imported',
  PRODUCT_EXPORTED: 'product_exported',
  
  // Inventory Management
  STOCK_ADJUSTED: 'stock_adjusted',
  STOCK_TRANSFER: 'stock_transfer',
  RESTOCK_ORDER_CREATED: 'restock_order_created',
  RESTOCK_ORDER_RECEIVED: 'restock_order_received',
  LOW_STOCK_ALERT: 'low_stock_alert',
  
  // Sales Operations
  SALE_CREATED: 'sale_created',
  SALE_UPDATED: 'sale_updated',
  SALE_CANCELLED: 'sale_cancelled',
  SALE_REFUNDED: 'sale_refunded',
  RECEIPT_PRINTED: 'receipt_printed',
  
  // Customer Management
  CUSTOMER_CREATED: 'customer_created',
  CUSTOMER_UPDATED: 'customer_updated',
  CUSTOMER_DELETED: 'customer_deleted',
  
  // Supplier Management
  SUPPLIER_CREATED: 'supplier_created',
  SUPPLIER_UPDATED: 'supplier_updated',
  SUPPLIER_DELETED: 'supplier_deleted',
  
  // Payment Operations
  PAYMENT_PROCESSED: 'payment_processed',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_PROCESSED: 'refund_processed',
  
  // System Operations
  SETTINGS_UPDATED: 'settings_updated',
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  DATA_IMPORT: 'data_import',
  DATA_EXPORT: 'data_export',
  
  // Security & Permissions
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  ROLE_CREATED: 'role_created',
  ROLE_UPDATED: 'role_updated',
  ROLE_DELETED: 'role_deleted',
  
  // Reporting
  REPORT_GENERATED: 'report_generated',
  REPORT_EXPORTED: 'report_exported',
  AUDIT_LOG_VIEWED: 'audit_log_viewed',
  
  // Data Operations
  DATA_SYNC: 'data_sync',
  DATA_BACKUP: 'data_backup',
  DATA_RESTORE: 'data_restore',
  
  // Error & Exception
  ERROR_OCCURRED: 'error_occurred',
  EXCEPTION_CAUGHT: 'exception_caught',
  VALIDATION_FAILED: 'validation_failed'
} as const;

// Helper function to create activity descriptions
export const createActivityDescription = (
  action: string,
  entity: string,
  details?: string
): string => {
  if (details) {
    return `${action} ${entity}: ${details}`;
  }
  return `${action} ${entity}`;
};

// Common activity descriptions
export const ACTIVITY_DESCRIPTIONS = {
  // User actions
  USER_LOGIN: (username: string) => `User ${username} logged in successfully`,
  USER_LOGOUT: (username: string) => `User ${username} logged out`,
  USER_CREATED: (username: string) => `New user ${username} created`,
  USER_UPDATED: (username: string) => `User ${username} profile updated`,
  
  // Business actions
  BUSINESS_CREATED: (businessName: string) => `New business "${businessName}" created`,
  BUSINESS_UPDATED: (businessName: string) => `Business "${businessName}" updated`,
  
  // Store actions
  STORE_CREATED: (storeName: string) => `New store "${storeName}" created`,
  STORE_UPDATED: (storeName: string) => `Store "${storeName}" updated`,
  
  // Product actions
  PRODUCT_CREATED: (productName: string) => `New product "${productName}" created`,
  PRODUCT_UPDATED: (productName: string) => `Product "${productName}" updated`,
  PRODUCT_DELETED: (productName: string) => `Product "${productName}" deleted`,
  
  // Sales actions
  SALE_CREATED: (receiptNumber: string, amount: number) => 
    `Sale completed with receipt #${receiptNumber} for ${amount}`,
  SALE_REFUNDED: (receiptNumber: string, amount: number) => 
    `Sale refunded for receipt #${receiptNumber}, amount: ${amount}`,
  
  // Inventory actions
  STOCK_ADJUSTED: (productName: string, oldQuantity: number, newQuantity: number) =>
    `Stock adjusted for "${productName}": ${oldQuantity} → ${newQuantity}`,
  
  // Settings actions
  SETTINGS_UPDATED: (settingType: string) => `${settingType} settings updated`,
  
  // System actions
  SYSTEM_BACKUP: () => 'System backup completed',
  DATA_IMPORT: (dataType: string, recordCount: number) => 
    `Imported ${recordCount} ${dataType} records`,
  DATA_EXPORT: (dataType: string, recordCount: number) => 
    `Exported ${recordCount} ${dataType} records`
} as const;

// Type definitions
export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];
export type ActivityCategory = typeof ACTIVITY_CATEGORIES[keyof typeof ACTIVITY_CATEGORIES];
