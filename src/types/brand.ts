// ============================================================================
// BRAND SPECIFIC TYPES
// ============================================================================

import { BrandFormData } from './forms';
import { Brand } from './database';

// Brand interface is available from database types

// Brand management component props
export interface BrandManagementProps {
  onBack: () => void;
}

// Brand form data with business_id
export interface BrandFormDataWithBusiness extends BrandFormData {
  business_id: string;
}

// Brand table column
export interface BrandColumn {
  key: string;
  label: string;
  render: (brand: Brand) => React.ReactNode;
}

// Brand filter options
export interface BrandFilters {
  searchTerm: string;
  logoFilter: 'all' | 'with-logo' | 'without-logo';
}

// Brand statistics
export interface BrandStats {
  total: number;
  withLogo: number;
  withoutLogo: number;
  active: number;
  inactive: number;
}

// Brand form field configuration
export interface BrandFormField {
  key: keyof BrandFormData;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

// Brand logo upload state
export interface BrandLogoState {
  selectedFile: File | null;
  preview: string | null;
  isUploading: boolean;
}
