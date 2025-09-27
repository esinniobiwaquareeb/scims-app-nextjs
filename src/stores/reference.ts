// ============================================================================
// REFERENCE DATA STORE HOOKS
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { ApiResponse } from '@/types';

// Language interface
export interface Language {
  id: string;
  name: string;
  code: string;
  native_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Currency interface
export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Country interface
export interface Country {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hook for fetching languages
export const useLanguages = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await fetch('/api/reference/languages');
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      const data: ApiResponse<Language[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for fetching currencies
export const useCurrencies = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await fetch('/api/reference/currencies');
      if (!response.ok) {
        throw new Error('Failed to fetch currencies');
      }
      const data: ApiResponse<Currency[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for fetching countries
export const useCountries = (options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch('/api/reference/countries');
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      const data: ApiResponse<Country[]> = await response.json();
      return data.data || [];
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for fetching a specific language
export const useLanguage = (languageId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['language', languageId],
    queryFn: async () => {
      const response = await fetch(`/api/reference/languages/${languageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch language');
      }
      const data: ApiResponse<Language> = await response.json();
      return data.data;
    },
    enabled: enabled && !!languageId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Hook for fetching a specific currency
export const useCurrency = (currencyId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['currency', currencyId],
    queryFn: async () => {
      const response = await fetch(`/api/reference/currencies/${currencyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch currency');
      }
      const data: ApiResponse<Currency> = await response.json();
      return data.data;
    },
    enabled: enabled && !!currencyId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

// Hook for fetching a specific country
export const useCountry = (countryId: string, options?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = options || {};
  
  return useQuery({
    queryKey: ['country', countryId],
    queryFn: async () => {
      const response = await fetch(`/api/reference/countries/${countryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch country');
      }
      const data: ApiResponse<Country> = await response.json();
      return data.data;
    },
    enabled: enabled && !!countryId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};
