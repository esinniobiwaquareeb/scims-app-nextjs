import { useCallback } from 'react';
import { useActivityLogger } from '@/contexts/ActivityLogger';
import { 
  ACTIVITY_TYPES, 
  ACTIVITY_CATEGORIES, 
  ACTIVITY_DESCRIPTIONS
} from '@/utils/activityTypes';

export const useActivityLogging = () => {
  const { logActivity, logUserActivity, logBusinessActivity, logStoreActivity } = useActivityLogger();

  // Authentication logging
  const logLogin = useCallback(async (username: string, metadata?: Record<string, string | number | boolean>) => {
    await logUserActivity(
      ACTIVITY_TYPES.AUTH,
      ACTIVITY_CATEGORIES.LOGIN_SUCCESS,
      ACTIVITY_DESCRIPTIONS.USER_LOGIN(username),
      metadata
    );
  }, [logUserActivity]);

  const logLogout = useCallback(async (username: string, metadata?: Record<string, string | number | boolean>) => {
    await logUserActivity(
      ACTIVITY_TYPES.AUTH,
      ACTIVITY_CATEGORIES.LOGOUT,
      ACTIVITY_DESCRIPTIONS.USER_LOGOUT(username),
      metadata
    );
  }, [logUserActivity]);

  const logLoginFailed = useCallback(async (username: string, reason: string, metadata?: Record<string, string | number | boolean>) => {
    await logUserActivity(
      ACTIVITY_TYPES.AUTH,
      ACTIVITY_CATEGORIES.LOGIN_FAILED,
      `Login failed for user ${username}: ${reason}`,
      metadata
    );
  }, [logUserActivity]);

  // User management logging
  const logUserCreated = useCallback(async (username: string, metadata?: Record<string, string | number | boolean>) => {
    await logUserActivity(
      ACTIVITY_TYPES.USER,
      ACTIVITY_CATEGORIES.USER_CREATED,
      ACTIVITY_DESCRIPTIONS.USER_CREATED(username),
      metadata
    );
  }, [logUserActivity]);

  const logUserUpdated = useCallback(async (username: string, metadata?: Record<string, string | number | boolean>) => {
    await logUserActivity(
      ACTIVITY_TYPES.USER,
      ACTIVITY_CATEGORIES.USER_UPDATED,
      ACTIVITY_DESCRIPTIONS.USER_UPDATED(username),
      metadata
    );
  }, [logUserActivity]);

  // Business management logging
  const logBusinessCreated = useCallback(async (businessName: string, metadata?: Record<string, string | number | boolean>) => {
    await logBusinessActivity(
      ACTIVITY_TYPES.BUSINESS,
      ACTIVITY_CATEGORIES.BUSINESS_CREATED,
      ACTIVITY_DESCRIPTIONS.BUSINESS_CREATED(businessName),
      metadata
    );
  }, [logBusinessActivity]);

  const logBusinessUpdated = useCallback(async (businessName: string, metadata?: Record<string, string | number | boolean>) => {
    await logBusinessActivity(
      ACTIVITY_TYPES.BUSINESS,
      ACTIVITY_CATEGORIES.BUSINESS_UPDATED,
      ACTIVITY_DESCRIPTIONS.BUSINESS_UPDATED(businessName),
      metadata
    );
  }, [logBusinessActivity]);

  // Store management logging
  const logStoreCreated = useCallback(async (storeName: string, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.STORE,
      ACTIVITY_CATEGORIES.STORE_CREATED,
      ACTIVITY_DESCRIPTIONS.STORE_CREATED(storeName),
      metadata
    );
  }, [logStoreActivity]);

  const logStoreUpdated = useCallback(async (storeName: string, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.STORE,
      ACTIVITY_CATEGORIES.STORE_UPDATED,
      ACTIVITY_DESCRIPTIONS.STORE_UPDATED(storeName),
      metadata
    );
  }, [logStoreActivity]);

  // Product management logging
  const logProductCreated = useCallback(async (productName: string, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.PRODUCT,
      ACTIVITY_CATEGORIES.PRODUCT_CREATED,
      ACTIVITY_DESCRIPTIONS.PRODUCT_CREATED(productName),
      metadata
    );
  }, [logStoreActivity]);

  const logProductUpdated = useCallback(async (productName: string, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.PRODUCT,
      ACTIVITY_CATEGORIES.PRODUCT_UPDATED,
      ACTIVITY_DESCRIPTIONS.PRODUCT_UPDATED(productName),
      metadata
    );
  }, [logStoreActivity]);

  const logProductDeleted = useCallback(async (productName: string, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.PRODUCT,
      ACTIVITY_CATEGORIES.PRODUCT_DELETED,
      ACTIVITY_DESCRIPTIONS.PRODUCT_DELETED(productName),
      metadata
    );
  }, [logStoreActivity]);

  // Sales logging
  const logSaleCreated = useCallback(async (receiptNumber: string, amount: number, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.SALE,
      ACTIVITY_CATEGORIES.SALE_CREATED,
      ACTIVITY_DESCRIPTIONS.SALE_CREATED(receiptNumber, amount),
      metadata
    );
  }, [logStoreActivity]);

  const logSaleRefunded = useCallback(async (receiptNumber: string, amount: number, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.SALE,
      ACTIVITY_CATEGORIES.SALE_REFUNDED,
      ACTIVITY_DESCRIPTIONS.SALE_REFUNDED(receiptNumber, amount),
      metadata
    );
  }, [logStoreActivity]);

  // Inventory logging
  const logStockAdjusted = useCallback(async (productName: string, oldQuantity: number, newQuantity: number, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.INVENTORY,
      ACTIVITY_CATEGORIES.STOCK_ADJUSTED,
      ACTIVITY_DESCRIPTIONS.STOCK_ADJUSTED(productName, oldQuantity, newQuantity),
      metadata
    );
  }, [logStoreActivity]);

  // Settings logging
  const logSettingsUpdated = useCallback(async (settingType: string, metadata?: Record<string, string | number | boolean>) => {
    await logStoreActivity(
      ACTIVITY_TYPES.SETTINGS,
      ACTIVITY_CATEGORIES.SETTINGS_UPDATED,
      ACTIVITY_DESCRIPTIONS.SETTINGS_UPDATED(settingType),
      metadata
    );
  }, [logStoreActivity]);

  // Generic logging functions
  const logCustomActivity = useCallback(async (
    activityType: string,
    category: string,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ) => {
    await logActivity(activityType, category, description, metadata);
  }, [logActivity]);

  const logError = useCallback(async (error: Error, context: string, metadata?: Record<string, string | number | boolean>) => {
    await logActivity(
      ACTIVITY_TYPES.SYSTEM,
      ACTIVITY_CATEGORIES.ERROR_OCCURRED,
      `Error in ${context}: ${error.message}`,
      {
        ...metadata,
        errorStack: error.stack || 'No stack trace available',
        errorName: error.name
      }
    );
  }, [logActivity]);

  const logValidationFailed = useCallback(async (entity: string, field: string, value: string | number | boolean, metadata?: Record<string, string | number | boolean>) => {
    await logActivity(
      ACTIVITY_TYPES.SYSTEM,
      ACTIVITY_CATEGORIES.VALIDATION_FAILED,
      `Validation failed for ${entity}.${field}: ${value}`,
      metadata
    );
  }, [logActivity]);

  return {
    // Authentication
    logLogin,
    logLogout,
    logLoginFailed,
    
    // User management
    logUserCreated,
    logUserUpdated,
    
    // Business management
    logBusinessCreated,
    logBusinessUpdated,
    
    // Store management
    logStoreCreated,
    logStoreUpdated,
    
    // Product management
    logProductCreated,
    logProductUpdated,
    logProductDeleted,
    
    // Sales
    logSaleCreated,
    logSaleRefunded,
    
    // Inventory
    logStockAdjusted,
    
    // Settings
    logSettingsUpdated,
    
    // Generic
    logCustomActivity,
    logError,
    logValidationFailed,
    
    // Constants for manual use
    ACTIVITY_TYPES,
    ACTIVITY_CATEGORIES
  };
};
