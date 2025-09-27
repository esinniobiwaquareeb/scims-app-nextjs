// ============================================================================
// USER RELATED TYPES
// ============================================================================

export interface User {
  id: string;
  username: string;
  email?: string;
  password_hash: string;
  name: string;
  role: 'superadmin' | 'business_admin' | 'store_admin' | 'cashier';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
  phone?: string;
  last_login?: string;
  email_verified?: boolean;
  email_verification_token?: string;
  email_verification_expires_at?: string;
  password_reset_token?: string;
  password_reset_expires_at?: string;
}

export interface UserBusinessRole {
  id: string;
  user_id: string;
  business_id?: string;
  store_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  business_id: string;
  store_id?: string;
  assigned_at: string;
  is_active: boolean;
}

export interface Role {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlatformRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system_role?: boolean;
  is_active?: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}
