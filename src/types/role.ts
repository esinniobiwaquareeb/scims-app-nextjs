// ============================================================================
// ROLE AND PERMISSION SPECIFIC TYPES
// ============================================================================

import React from 'react';
import { Role, UserRole } from './database';
import { RoleFormData as BaseRoleFormData } from './forms';

// Role management component props
export interface RoleProps {
  onBack: () => void;
}

// Extended role interface for UI display
export interface RoleDisplay extends Role {
  user_count: number;
  permission_count: number;
  can_edit: boolean;
  can_delete: boolean;
  can_assign: boolean;
  is_default: boolean;
  last_used?: string;
  created_by_name?: string;
}

// Extended user role interface for UI display
export interface UserRoleDisplay extends UserRole {
  user_name: string;
  user_email: string;
  user_username: string;
  role_name: string;
  role_description?: string;
  business_name?: string;
  store_name?: string;
  can_revoke: boolean;
  can_modify: boolean;
  assigned_by_name?: string;
}

// Permission interface for role management
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  business_id?: string;
  is_system_permission: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Permission category interface
export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  order: number;
  is_system_category: boolean;
}

// Role filters
export interface RoleFilters {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: 'all' | 'active' | 'inactive';
  typeFilter: 'all' | 'system' | 'custom';
}

// Role statistics
export interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;
  systemRoles: number;
  customRoles: number;
  totalUsers: number;
  totalPermissions: number;
  mostUsedRole: string;
  leastUsedRole: string;
}

// Role table column
export interface RoleColumn {
  key: string;
  label: string;
  render: (role: RoleDisplay) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

// Role action
export interface RoleAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: (role: RoleDisplay) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (role: RoleDisplay) => boolean;
}

// Role state
export interface RoleState {
  searchTerm: string;
  selectedCategory: string;
  isAddRoleDialogOpen: boolean;
  isEditRoleDialogOpen: boolean;
  isDeleteRoleDialogOpen: boolean;
  isAssignRoleDialogOpen: boolean;
  isViewPermissionsDialogOpen: boolean;
  selectedRole: RoleDisplay | null;
  selectedUser: UserRoleDisplay | null;
  roleToDelete: RoleDisplay | null;
  newRole: Partial<RoleFormData>;
}

// Role form data
export type RoleFormData = BaseRoleFormData;

// Role validation errors
export interface RoleValidationErrors {
  name?: string;
  description?: string;
  permissions?: string;
  general?: string;
}

// Role export options
export interface RoleExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeUsers?: boolean;
  includePermissions?: boolean;
  includeInactive?: boolean;
}

// Role import options
export interface RoleImportOptions {
  file: File;
  mapping: {
    name: string;
    description: string;
    permissions: string;
    is_system_role: string;
    is_active: string;
  };
  options: {
    updateExisting: boolean;
    createMissing: boolean;
    validatePermissions: boolean;
  };
}

// Role assignment
export interface RoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  business_id: string;
  store_id?: string;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  notes?: string;
}

// Role template
export interface RoleTemplate {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system_template: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Role audit log
export interface RoleAuditLog {
  id: string;
  action: 'role_created' | 'role_updated' | 'role_deleted' | 'role_assigned' | 'role_revoked' | 'permission_granted' | 'permission_revoked';
  role_id?: string;
  user_id?: string;
  details: Record<string, unknown>;
  performed_by: string;
  performed_by_name: string;
  timestamp: string;
}

// Role notification
export interface RoleNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  role_id?: string;
  user_id?: string;
  created_at: string;
  read: boolean;
}

// Role settings
export interface RoleSettings {
  allow_custom_roles: boolean;
  require_approval_for_role_changes: boolean;
  max_roles_per_user: number;
  default_role: string;
  role_expiration_enabled: boolean;
  default_role_expiration_days: number;
  notification_enabled: boolean;
  notification_types: string[];
}

// Role performance metrics
export interface RolePerformance {
  total_roles: number;
  active_roles: number;
  inactive_roles: number;
  total_assignments: number;
  successful_assignments: number;
  failed_assignments: number;
  most_used_roles: Array<{
    role_id: string;
    role_name: string;
    assignment_count: number;
  }>;
  least_used_roles: Array<{
    role_id: string;
    role_name: string;
    assignment_count: number;
  }>;
  permission_usage: Array<{
    permission_id: string;
    permission_name: string;
    usage_count: number;
  }>;
}

// Role comparison
export interface RoleComparison {
  id: string;
  name: string;
  description?: string;
  base_role_id: string;
  compare_role_id: string;
  differences: Array<{
    type: 'permission_added' | 'permission_removed' | 'permission_modified';
    permission_id: string;
    permission_name: string;
    base_value: string;
    compare_value: string;
  }>;
  created_at: string;
  created_by: string;
}

// Role hierarchy
export interface RoleHierarchy {
  id: string;
  name: string;
  level: number;
  parent_role_id?: string;
  child_roles: string[];
  permissions: string[];
  inherited_permissions: string[];
  effective_permissions: string[];
}

// Role workflow
export interface RoleWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    id: string;
    name: string;
    type: 'approval' | 'notification' | 'action';
    config: Record<string, unknown>;
    order: number;
  }>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Role backup
export interface RoleBackup {
  id: string;
  name: string;
  description?: string;
  data: {
    roles: Role[];
    user_roles: UserRole[];
    permissions: Permission[];
    settings: RoleSettings;
  };
  created_at: string;
  created_by: string;
}

// Role restore
export interface RoleRestore {
  id: string;
  backup_id: string;
  options: {
    restoreRoles: boolean;
    restoreUserRoles: boolean;
    restorePermissions: boolean;
    restoreSettings: boolean;
  };
  created_at: string;
  created_by: string;
}

// Role dashboard data
export interface RoleDashboardData {
  stats: RoleStats;
  recentRoles: RoleDisplay[];
  recentAssignments: UserRoleDisplay[];
  topRoles: Array<{
    role: RoleDisplay;
    user_count: number;
  }>;
  permissionUsage: Array<{
    permission: Permission;
    usage_count: number;
  }>;
  alerts: RoleNotification[];
}

// Role search result
export interface RoleSearchResult {
  id: string;
  name: string;
  description?: string;
  type: 'role' | 'permission' | 'user';
  category?: string;
}

// Role bulk action
export interface RoleBulkAction {
  role_ids: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'export';
  options?: Record<string, unknown>;
}

// Role conflict
export interface RoleConflict {
  id: string;
  type: 'permission_conflict' | 'role_conflict' | 'assignment_conflict';
  description: string;
  affected_roles: string[];
  affected_users: string[];
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}
