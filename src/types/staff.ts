// ============================================================================
// STAFF SPECIFIC TYPES
// ============================================================================

import { User, Store } from './database';

// Extended staff interface for UI display
export interface Staff extends User {
  store_id?: string;
  storeName?: string;
  totalSales?: number;
  transactionCount?: number;
  permissions?: string[];
}

// Staff management specific interfaces
export interface StaffManagementProps {
  onBack: () => void;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
}

// Role options for staff
export interface RoleOption {
  value: 'business_admin' | 'store_admin' | 'cashier';
  label: string;
  color: string;
}

// Permission options for staff
export interface PermissionOption {
  value: string;
  label: string;
}

// Staff form props
export interface StaffFormProps {
  staffMember: Partial<Staff> | Staff;
  onChange: (staffMember: Partial<Staff>) => void;
  onSave: () => void;
  onCancel: () => void;
  stores: Store[];
  isSaving: boolean;
}

// Staff statistics
export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  totalSales: number;
  avgPerformance: number;
}

// Staff credentials for new staff
export interface StaffCredentials {
  username: string;
  password: string;
}
