// ============================================================================
// REFERENCE DATA TYPES
// ============================================================================

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

// Language option for dropdowns
export interface LanguageOption {
  value: string;
  label: string;
  code: string;
  native_name: string;
}

// Currency option for dropdowns
export interface CurrencyOption {
  value: string;
  label: string;
  code: string;
  symbol: string;
}

// Country option for dropdowns
export interface CountryOption {
  value: string;
  label: string;
  code: string;
}

// Reference data state
export interface ReferenceDataState {
  languages: Language[];
  currencies: Currency[];
  countries: Country[];
  isLoading: boolean;
  error: string | null;
}

// Reference data context
export interface ReferenceDataContextType {
  languages: Language[];
  currencies: Currency[];
  countries: Country[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
