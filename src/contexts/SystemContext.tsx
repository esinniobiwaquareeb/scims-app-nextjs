'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguages, useCurrencies } from '@/utils/hooks/useStoreData';
import { 
  useStoreSettings
} from '../utils/hooks/stores';
import { useBusinessSettings } from '@/utils/hooks/businessSettings';
import { translate as translateUtil } from '../utils/translations';
import { printReceipt as printReceiptUtil, previewReceipt as previewReceiptUtil, ReceiptData } from '../utils/receipt';
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
  previewReceipt: (receiptData: ReceiptData) => void;
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

  const [storeSettings] = useState<StoreSettings[]>([]);
  const [currentStoreSettings, setCurrentStoreSettings] = useState<StoreSettings | null>(null);
  const [currentBusinessSettings, setCurrentBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load system settings with real data from database
  const { data: languages = [] } = useLanguages();
  const { data: currencies = [] } = useCurrencies();

  useEffect(() => {
    // Only update if we have data and it's different from current state
    if (languages.length > 0 || currencies.length > 0) {
      setSystemSettings(prev => {
        // Check if the data is actually different to prevent unnecessary updates
        if (JSON.stringify(prev.supportedLanguages) !== JSON.stringify(languages) ||
            JSON.stringify(prev.supportedCurrencies) !== JSON.stringify(currencies)) {
          return {
            ...prev,
            supportedCurrencies: currencies,
            supportedLanguages: languages
          };
        }
        return prev;
      });
    }
  }, [languages, currencies]);

  // Load store settings with real data from database
  const { data: storeSettingsData } = useStoreSettings(currentStore?.id || '', {
    enabled: !!currentStore?.id
  });

  useEffect(() => {
    if (storeSettingsData) {
      setCurrentStoreSettings(prev => {
        // Only update if data is actually different
        if (JSON.stringify(prev) !== JSON.stringify(storeSettingsData)) {
          return storeSettingsData;
        }
        return prev;
      });
    }
    // Only set loading to false once we have data or if there's no store
    if (storeSettingsData || !currentStore?.id) {
      setIsLoading(false);
    }
  }, [storeSettingsData, currentStore?.id]);

  // Load business settings with real data from database
  const { data: businessSettingsData } = useBusinessSettings(currentBusiness?.id || '', {
    enabled: !!currentBusiness?.id
  });

  useEffect(() => {
    if (businessSettingsData) {
      setCurrentBusinessSettings(prev => {
        // Only update if data is actually different
        if (JSON.stringify(prev) !== JSON.stringify(businessSettingsData)) {
          return businessSettingsData;
        }
        return prev;
      });
    }
  }, [businessSettingsData]);

  const updateSystemSettings = async (newSettings: SystemSettings) => {
    try {
      if (user?.role === 'superadmin') {
        const updatedSettings = { ...systemSettings, ...newSettings };
    
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
        // For now, do nothing - settings are already loaded
      } catch (error) {
        console.error('Failed to refresh store settings:', error);
      }
    }
  };

  const getCurrentLocale = () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */

    // First check store settings language (highest priority)
    if (currentStoreSettings?.language_id) {
      const language = systemSettings.supportedLanguages.find((l: Language) => l.id === currentStoreSettings.language_id);
      return language?.code || 'en';
    }
    
    // Then check store language (second priority)
    if ((currentStore as any)?.language_id) {
      const language = systemSettings.supportedLanguages.find((l: Language) => l.id === (currentStore as any).language_id);
      return language?.code || 'en';
    }
    
    // Then check business language (third priority)
    if ((currentBusiness as any)?.language_id) {
      const language = systemSettings.supportedLanguages.find((l: Language) => l.id === (currentBusiness as any).language_id);
      return language?.code || 'en';
    }
    
    // Finally fall back to platform default (lowest priority)
    return systemSettings.defaultLanguage;
  };

  const getCurrentCurrency = () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // First check store settings currency (highest priority)
    if (currentStoreSettings?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentStoreSettings.currency_id);
      return currency?.symbol || '$';
    }
    
    // Then check store currency (second priority)
    if ((currentStore as any)?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === (currentStore as any).currency_id);
      return currency?.symbol || '$';
    }
    
    // Then check business currency (third priority) - from business object directly
    if ((currentBusiness as any)?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === (currentBusiness as any).currency_id);
      return currency?.symbol || '$';
    }
    
    // Finally fall back to platform default (lowest priority)
    // Find the default currency object to get its symbol
    const defaultCurrency = systemSettings.supportedCurrencies.find((c: Currency) => c.code === systemSettings.defaultCurrency);
    return defaultCurrency?.symbol || '$';
  };

  // Get business-specific currency (ignoring store overrides)
  const getBusinessCurrency = () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if ((currentBusiness as any)?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === (currentBusiness as any).currency_id);
      return currency?.symbol || '$';
    }
    // Find the default currency object to get its symbol
    const defaultCurrency = systemSettings.supportedCurrencies.find((c: Currency) => c.code === systemSettings.defaultCurrency);
    return defaultCurrency?.symbol || '$';
  };

  // Get business-specific language (ignoring store overrides)
  const getBusinessLocale = () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if ((currentBusiness as any)?.language_id) {
      const language = systemSettings.supportedLanguages.find((l: Language) => l.id === (currentBusiness as any).language_id);
      return language?.code || 'en';
    }
    return systemSettings.defaultLanguage;
  };

  // Get current currency code (needed for formatCurrency function)
  const getCurrentCurrencyCode = () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // First check store settings currency (highest priority)
    if (currentStoreSettings?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === currentStoreSettings.currency_id);
      return currency?.code || 'USD';
    }
    
    // Then check store currency (second priority)
    if ((currentStore as any)?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === (currentStore as any).currency_id);
      return currency?.code || 'USD';
    }
    
    // Then check business currency (third priority)
    if ((currentBusiness as any)?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === (currentBusiness as any).currency_id);
      return currency?.code || 'USD';
    }
    
    // Finally fall back to platform default (lowest priority)
    return systemSettings.defaultCurrency;
  };

  // Get business-specific currency code (ignoring store overrides)
  const getBusinessCurrencyCode = () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if ((currentBusiness as any)?.currency_id) {
      const currency = systemSettings.supportedCurrencies.find((c: Currency) => c.id === (currentBusiness as any).currency_id);
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



  const formatDate = (date: Date) => {
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
      formatTime,
      formatCurrency
    );
  };

  const previewReceipt = (receiptData: ReceiptData) => {
        previewReceiptUtil(
      receiptData,
      currentStore,
      currentStoreSettings,
      currentBusinessSettings,
      formatDate,
      formatTime,
      formatCurrency
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
      previewReceipt, 
      isLoading 
    }}>
      {children}
    </SystemContext.Provider>
  );
};