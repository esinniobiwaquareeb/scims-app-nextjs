'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
// TODO: Replace with actual direct client when available
// import { directDB } from '../utils/supabase/direct-client';
import { useAuth } from './AuthContext';
import { translate as translateUtil } from '../utils/translations';
import { printReceipt as printReceiptUtil, ReceiptData } from '../utils/receipt';
import {
  formatDate as formatDateUtil,
  formatTime as formatTimeUtil,
  formatDateTime as formatDateTimeUtil,
  formatCompactDateTime as formatCompactDateTimeUtil,
  formatShortDateTime as formatShortDateTimeUtil,
  formatRelativeTime as formatRelativeTimeUtil,
  formatTableDate as formatTableDateUtil,
  formatTableTime as formatTableTimeUtil,
  formatTableDateTime as formatTableDateTimeUtil,
  formatChartDate as formatChartDateUtil,
  formatChartTime as formatChartTimeUtil,
  isToday as isTodayUtil,
  isYesterday as isYesterdayUtil,
  getStartOfDay as getStartOfDayUtil,
  getEndOfDay as getEndOfDayUtil,
  getStartOfWeek as getStartOfWeekUtil,
  getStartOfMonth as getStartOfMonthUtil,
  getEndOfMonth as getEndOfMonthUtil,
  addDays as addDaysUtil,
  subtractDays as subtractDaysUtil,
  getDaysDifference as getDaysDifferenceUtil,
  formatDateRange as formatDateRangeUtil
} from '@/utils/date-utils';

// Translations are now imported from utils/translations.ts

// Define interfaces for system data structures
interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

interface SystemSettings {
  defaultCurrency: string;
  defaultLanguage: string;
  supportedCurrencies: Currency[];
  supportedLanguages: Language[];
  demoMode: boolean;
  maintenanceMode: boolean;
  platformName: string;
  platformVersion: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  allowUsernameLogin: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  systemStatus: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  lastHealthCheck: Date;
}

interface StoreSettings {
  id: string;
  store_id: string;
  currency_id?: string | null;
  language_id?: string | null;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  tax_rate?: number;
  discount_enabled?: boolean;
  receipt_header?: string;
  receipt_footer?: string;
  [key: string]: unknown;
}

interface BusinessSettings {
  id: string;
  business_id: string;
  default_currency_id?: string | null;
  default_language_id?: string | null;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  [key: string]: unknown;
}

// Define the context type
interface SystemContextType {
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: SystemSettings) => Promise<void>;
  storeSettings: StoreSettings[];
  getStoreSettings: (storeId: string) => Promise<StoreSettings>;
  updateStoreSettings: (storeId: string, settings: StoreSettings) => Promise<void>;
  refreshStoreSettings: () => Promise<void>;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date, format?: string) => string;
  formatDateTime: (date: Date) => string;
  formatCompactDateTime: (date: Date) => string;
  formatShortDateTime: (date: Date) => string;
  formatRelativeTime: (date: Date) => string;
  formatTableDate: (date: Date) => string;
  formatTableTime: (date: Date) => string;
  formatTableDateTime: (date: Date) => string;
  formatChartDate: (date: Date) => string;
  formatChartTime: (date: Date) => string;
  isToday: (date: Date) => boolean;
  isYesterday: (date: Date) => boolean;
  getStartOfDay: (date: Date) => Date;
  getEndOfDay: (date: Date) => Date;
  getStartOfWeek: (date: Date) => Date;
  getStartOfMonth: (date: Date) => Date;
  getEndOfMonth: (date: Date) => Date;
  addDays: (date: Date, days: number) => Date;
  subtractDays: (date: Date, days: number) => Date;
  getDaysDifference: (date1: Date, date2: Date) => number;
  formatDateRange: (startDate: Date, endDate: Date) => string;
  getBusinessTimezone: () => string | undefined;
  translate: (key: string, params?: Record<string, unknown>) => string;
  playSound: (type: string) => void;
  getCurrentLocale: () => string;
  getCurrentCurrency: () => string;
  getCurrentCurrencyCode: () => string;
  getBusinessCurrency: () => string;
  getBusinessCurrencyCode: () => string;
  getBusinessLocale: () => string;
  printReceipt: (receiptData: ReceiptData) => void;
  isLoading: boolean;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = (): SystemContextType => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, currentStore, currentBusiness } = useAuth();
  
  // Default system settings - will be populated from database
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    supportedCurrencies: [],
    supportedLanguages: [],
    demoMode: false,
    maintenanceMode: false,
    platformName: 'SCIMS',
    platformVersion: '1.0.0',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    allowUsernameLogin: true,
    requireEmailVerification: false,
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    systemStatus: 'healthy',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeConnections: 0,
    lastHealthCheck: new Date(),
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings[]>([]);
  const [currentStoreSettings, setCurrentStoreSettings] = useState<StoreSettings | null>(null);
  const [currentBusinessSettings, setCurrentBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load system settings
  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        // TODO: Implement when directDB is available
        console.log('System settings loading not yet implemented');
        
        // For now, use default settings
        setSystemSettings(prev => ({
          ...prev,
          supportedCurrencies: [
            { id: '1', code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
            { id: '2', code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
            { id: '3', code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 }
          ],
          supportedLanguages: [
            { id: '1', code: 'en', name: 'English', nativeName: 'English', rtl: false },
            { id: '2', code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
            { id: '3', code: 'fr', name: 'French', nativeName: 'Français', rtl: false }
          ]
        }));

        // TODO: Load supported currencies and languages from database when directDB is available
        console.log('Currency and language loading not yet implemented');
      } catch (error) {
        console.error('Failed to load system settings:', error);
        // Use default settings on error
      }
    };

    loadSystemSettings();
  }, [user]);

  // Load store settings when current store changes
  useEffect(() => {
    const loadStoreSettings = async () => {
      if (currentStore?.id) {
        try {
          // TODO: Replace with actual API call when available
          // const response = await directDB.getStoreSettings(currentStore.id);
          console.log('Store settings loading not yet implemented');
          
          // Use default store settings for now
          setCurrentStoreSettings({
            id: 'default', // Placeholder ID
            store_id: currentStore.id,
            currency_id: null,
            language_id: null,
            timezone: 'UTC',
            date_format: 'MM/dd/yyyy',
            time_format: '12h',
            tax_rate: 0,
            discount_enabled: false,
            receipt_header: 'Thank you for shopping with us!',
            receipt_footer: 'Returns accepted within 30 days with receipt.',
            return_policy: 'Returns accepted within 30 days with original receipt.',
            contact_person: '',
            store_hours: '',
            store_promotion_info: '',
            custom_receipt_message: ''
          });
        } catch (error) {
          console.error('Failed to load store settings:', error);
          // Use default store settings from business
          setCurrentStoreSettings({
            id: 'default', // Placeholder ID
            store_id: currentStore.id,
            currency_id: null,
            language_id: null,
            timezone: 'UTC',
            date_format: 'MM/dd/yyyy',
            time_format: '12h',
            tax_rate: 0,
            discount_enabled: false,
            receipt_header: 'Thank you for shopping with us!',
            receipt_footer: 'Returns accepted within 30 days with receipt.',
            return_policy: 'Returns accepted within 30 days with original receipt.',
            contact_person: '',
            store_hours: '',
            store_promotion_info: '',
            custom_receipt_message: ''
          });
        }
      }
      setIsLoading(false);
    };

    loadStoreSettings();
  }, [currentStore]);

  // Load business settings when current business changes
  useEffect(() => {
    const loadBusinessSettings = async () => {
      if (currentBusiness?.id) {
        try {
          // TODO: Replace with actual API call when available
          // const response = await directDB.getBusinessSettings(currentBusiness.id);
          console.log('Business settings loading not yet implemented');
          
          // Use default business settings for now
          setCurrentBusinessSettings({
            id: 'default', // Placeholder ID
            business_id: currentBusiness.id,
            default_currency_id: null,
            default_language_id: null,
            timezone: 'UTC',
            date_format: 'MM/dd/yyyy',
            time_format: '12h',
            tax_rate: 0.00,
            enable_tax: false,
            allow_returns: true,
            return_period_days: 30,
            enable_sounds: true,
            logo_url: '',
            primary_color: '#3B82F6',
            secondary_color: '#10B981',
            accent_color: '#F59E0B',
            receipt_header: 'Thank you for shopping with us!',
            receipt_footer: 'Returns accepted within 30 days with receipt.',
            return_policy: 'Returns accepted within 30 days with original receipt.',
            warranty_info: 'Standard manufacturer warranty applies.',
            terms_of_service: '',
            privacy_policy: '',
            business_type: 'retail',
            enable_stock_tracking: true,
            enable_inventory_alerts: true,
            enable_restock_management: true,
            enable_recipe_management: false,
            enable_service_booking: false,
            enable_menu_management: false,
            enable_ingredient_tracking: false
          });
        } catch (error) {
          console.error('Failed to load business settings:', error);
          // Use default business settings
          setCurrentBusinessSettings({
            id: 'default', // Placeholder ID
            business_id: currentBusiness.id,
            default_currency_id: null,
            default_language_id: null,
            timezone: 'UTC',
            date_format: 'MM/dd/yyyy',
            time_format: '12h',
            tax_rate: 0.00,
            enable_tax: false,
            allow_returns: true,
            return_period_days: 30,
            enable_sounds: true,
            logo_url: '',
            primary_color: '#3B82F6',
            secondary_color: '#10B981',
            accent_color: '#F59E0B',
            receipt_header: 'Thank you for shopping with us!',
            receipt_footer: 'Returns accepted within 30 days with receipt.',
            return_policy: 'Returns accepted within 30 days with original receipt.',
            warranty_info: 'Standard manufacturer warranty applies.',
            terms_of_service: '',
            privacy_policy: '',
            business_type: 'retail',
            enable_stock_tracking: true,
            enable_inventory_alerts: true,
            enable_restock_management: true,
            enable_recipe_management: false,
            enable_service_booking: false,
            enable_menu_management: false,
            enable_ingredient_tracking: false
          });
        }
      }
    };

    loadBusinessSettings();
  }, [currentBusiness]);

  const updateSystemSettings = async (newSettings: SystemSettings) => {
    try {
      if (user?.role === 'superadmin') {
        const updatedSettings = { ...systemSettings, ...newSettings };
        // TODO: Replace with actual API call when available
        // await directDB.updateSystemSettings(updatedSettings);
        console.log('System settings update not yet implemented');
        setSystemSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Failed to update system settings:', error);
      throw error;
    }
  };

  const getStoreSettings = (storeId: string) => {
    // If requesting current store settings, return them directly
    if (currentStore?.id === storeId) {
      return currentStoreSettings || null;
    }
    
    // For other stores, try to find in storeSettings array
    return storeSettings.find((s: StoreSettings) => s.store_id === storeId) || null;
  };

  const updateStoreSettings = async (storeId: string, newSettings: StoreSettings) => {
    try {
      // TODO: Replace with actual API call when available
      // await directDB.updateStoreSettings(storeId, newSettings);
      console.log('Store settings update not yet implemented');
      
      // For now, just update local state
      if (currentStore?.id === storeId) {
        setCurrentStoreSettings((prev: StoreSettings | null) => ({ ...prev, ...newSettings }));
      }
    } catch (error) {
      console.error('Failed to update store settings:', error);
      throw error;
    }
  };

  const refreshStoreSettings = async () => {
    if (currentStore?.id) {
      try {
        // TODO: Replace with actual API call when available
        // const response = await directDB.getStoreSettings(currentStore.id);
        console.log('Store settings refresh not yet implemented');
        // For now, do nothing - settings are already loaded
      } catch (error) {
        console.error('Failed to refresh store settings:', error);
      }
    }
  };

  const getCurrentLocale = () => {
    console.log('getCurrentLocale called with:', {
      storeLanguageId: currentStoreSettings?.language_id,
      businessLanguageId: currentBusinessSettings?.default_language_id,
      platformDefault: systemSettings.defaultLanguage,
      supportedLanguages: systemSettings.supportedLanguages
    });

    // First check store-specific language (highest priority)
    if (currentStoreSettings?.language_id) {
      // Find the language object from supported languages
      const language = systemSettings.supportedLanguages.find((l: Language) => l.id === currentStoreSettings.language_id);
      console.log('Store language found:', language);
      return language?.code || 'en';
    }
    
    // Then check business language (second priority)
    if (currentBusinessSettings?.default_language_id) {
      const language = systemSettings.supportedLanguages.find((l: Language) => l.id === currentBusinessSettings.default_language_id);
      console.log('Business language found:', language);
      return language?.code || 'en';
    }
    
    // Finally fall back to platform default (lowest priority)
    console.log('Using platform default language:', systemSettings.defaultLanguage);
    return systemSettings.defaultLanguage;
  };

  const getCurrentCurrency = () => {
    console.log('getCurrentCurrency called with:', {
      storeCurrencyId: currentStoreSettings?.currency_id,
      businessCurrencyId: currentBusinessSettings?.default_currency_id,
      platformDefault: systemSettings.defaultCurrency,
      supportedCurrencies: systemSettings.supportedCurrencies
    });

    // First check store-specific currency (highest priority)
    if (currentStoreSettings?.currency_id) {
      // Find the currency object from supported currencies
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentStoreSettings.currency_id);
      console.log('Store currency found:', currency);
      return currency?.symbol || '$';
    }
    
    // Then check business currency (second priority)
    if (currentBusinessSettings?.default_currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentBusinessSettings.default_currency_id);
      console.log('Business currency found:', currency);
      return currency?.symbol || '$';
    }
    
    // Finally fall back to platform default (lowest priority)
    console.log('Using platform default currency:', systemSettings.defaultCurrency);
    // Find the default currency object to get its symbol
    const defaultCurrency = systemSettings.supportedCurrencies.find((c: Currency) => c.code === systemSettings.defaultCurrency);
    return defaultCurrency?.symbol || '$';
  };

  // Get business-specific currency (ignoring store overrides)
  const getBusinessCurrency = () => {
    if (currentBusinessSettings?.default_currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentBusinessSettings.default_currency_id);
      return currency?.symbol || '$';
    }
    // Find the default currency object to get its symbol
    const defaultCurrency = systemSettings.supportedCurrencies.find((c: Currency) => c.code === systemSettings.defaultCurrency);
    return defaultCurrency?.symbol || '$';
  };

  // Get business-specific language (ignoring store overrides)
  const getBusinessLocale = () => {
    if (currentBusinessSettings?.default_language_id) {
      const language = systemSettings.supportedLanguages.find((l: Language) => l.id === currentBusinessSettings.default_language_id);
      return language?.code || 'en';
    }
    return systemSettings.defaultLanguage;
  };

  // Get current currency code (needed for formatCurrency function)
  const getCurrentCurrencyCode = () => {
    // First check store-specific currency (highest priority)
    if (currentStoreSettings?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentStoreSettings.currency_id);
      return currency?.code || 'USD';
    }
    
    // Then check business currency (second priority)
    if (currentBusinessSettings?.default_currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentBusinessSettings.default_currency_id);
      return currency?.code || 'USD';
    }
    
    // Finally fall back to platform default (lowest priority)
    return systemSettings.defaultCurrency;
  };

  // Get business-specific currency code (ignoring store overrides)
  const getBusinessCurrencyCode = () => {
    if (currentBusinessSettings?.default_currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentBusinessSettings.default_currency_id);
      return currency?.code || 'USD';
    }
    return systemSettings.defaultCurrency;
  };

  const formatCurrency = (amount: number, currencyCode?: string, storeSpecific = true) => {
    let code;
    
    if (currencyCode) {
      code = currencyCode;
    } else if (storeSpecific) {
      code = getCurrentCurrencyCode(); // Use the code, not the symbol
    } else {
      code = systemSettings.defaultCurrency;
    }
    
    // Find currency by code (either from parameter or from current settings)
    const currency = systemSettings.supportedCurrencies.find((c) => c.code === code);
    
    if (!currency) {
      // Fallback to basic formatting if currency not found
      return `${code || 'USD'} ${amount.toFixed(2)}`;
    }
    
    const formatter = new Intl.NumberFormat(getCurrentLocale(), {
      style: 'currency',
      currency: code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    });

    return formatter.format(amount);
  };



  const formatDate = (date: Date, format?: string) => {
    if (!date) return '';
    
    // Use centralized utility for consistent formatting with business timezone
    return formatDateUtil(date, { 
      showYear: true,
      businessTimezone: currentBusiness?.timezone
    });
  };

  const formatTime = (date: Date, format?: string) => {
    // Use centralized utility for consistent formatting with business timezone
    return formatTimeUtil(date, { 
      hour12: format !== '24h',
      showSeconds: true,
      businessTimezone: currentBusiness?.timezone
    });
  };

  const translate = (key: string, params?: Record<string, unknown>) => {
    const currentLang = getCurrentLocale();
    return translateUtil(key, params, currentLang);
  };

  const playSound = (soundType: string) => {
    if (!currentStoreSettings?.enable_sounds) return;

    try {
      // Create audio context for sound effects
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Configure sound based on type
      switch (soundType) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          break;
        case 'success':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
          break;
        case 'notification':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
          break;
        default:
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      }

      // Configure gain (volume)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Clean up
      setTimeout(() => {
        audioContext.close();
      }, 1000);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const printReceipt = (receiptData: ReceiptData) => {
        printReceiptUtil(
      receiptData,
      currentStore,
      currentStoreSettings,
      currentBusinessSettings,
      formatDate,
      formatTime
    );
  };

  return (
    <SystemContext.Provider value={{ 
      systemSettings, 
      updateSystemSettings, 
      storeSettings, 
      getStoreSettings: getStoreSettings as unknown as (storeId: string) => Promise<StoreSettings>, 
      updateStoreSettings, 
      refreshStoreSettings,
      formatCurrency, 
      formatDate, 
      formatTime, 
      formatDateTime: formatDateTimeUtil,
      formatCompactDateTime: formatCompactDateTimeUtil,
      formatShortDateTime: formatShortDateTimeUtil,
      formatRelativeTime: formatRelativeTimeUtil,
      formatTableDate: formatTableDateUtil,
      formatTableTime: formatTableTimeUtil,
      formatTableDateTime: formatTableDateTimeUtil,
      formatChartDate: formatChartDateUtil,
      formatChartTime: formatChartTimeUtil,
      isToday: isTodayUtil,
      isYesterday: isYesterdayUtil,
      getStartOfDay: getStartOfDayUtil,
      getEndOfDay: getEndOfDayUtil,
      getStartOfWeek: getStartOfWeekUtil,
      getStartOfMonth: getStartOfMonthUtil,
      getEndOfMonth: getEndOfMonthUtil,
      addDays: addDaysUtil,
      subtractDays: subtractDaysUtil,
      getDaysDifference: getDaysDifferenceUtil,
      formatDateRange: formatDateRangeUtil,
      getBusinessTimezone: () => currentBusiness?.timezone,
      translate, 
      playSound, 
      getCurrentLocale, 
      getCurrentCurrency, 
      getCurrentCurrencyCode, 
      getBusinessCurrency, 
      getBusinessCurrencyCode, 
      getBusinessLocale, 
      printReceipt, 
      isLoading 
    }}>
      {children}
    </SystemContext.Provider>
  );
};