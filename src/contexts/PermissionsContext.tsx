'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  business_id: string;
  is_active: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
}

interface PermissionsContextType {
  permissions: Permission[];
  roles: Role[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canView: (resource: string) => boolean;
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user, currentBusiness } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user permissions from the database
  const fetchUserPermissions = async () => {
    if (!user?.id || !currentBusiness?.id) {
      setPermissions([]);
      setRoles([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch user permissions
      const permissionsResponse = await fetch(`/api/permissions/user?business_id=${currentBusiness.id}&user_id=${user.id}`);
      if (!permissionsResponse.ok) {
        throw new Error('Failed to fetch user permissions');
      }
      const userPermissions = await permissionsResponse.json();

      // Fetch business roles
      const rolesResponse = await fetch(`/api/roles?business_id=${currentBusiness.id}`);
      if (!rolesResponse.ok) {
        throw new Error('Failed to fetch business roles');
      }
      const businessRoles = await rolesResponse.json();

      setPermissions(userPermissions || []);
      setRoles(businessRoles || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      // Fallback to empty permissions
      setPermissions([]);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh permissions
  const refreshPermissions = async () => {
    await fetchUserPermissions();
  };

  // Fetch permissions when user or business changes
  useEffect(() => {
    fetchUserPermissions();
  }, [user?.id, currentBusiness?.id]);

  // Permission checking logic
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!permission || !permissions.length) return false;
      
      // Check for wildcard permission
      if (permissions.some(p => p.id === '*' || p.id === 'business.*')) return true;
      
      // Check for exact permission match
      if (permissions.some(p => p.id === permission)) return true;
      
      // Check for resource-level permissions (e.g., "product.*" matches "product.create")
      const resource = permission.split('.')[0];
      const action = permission.split('.')[1];
      
      if (resource && action) {
        const resourcePermission = `${resource}.*`;
        if (permissions.some(p => p.id === resourcePermission)) return true;
      }
      
      return false;
    };
  }, [permissions]);

  const hasRole = useMemo(() => {
    return (role: string): boolean => {
      if (!role || !roles.length) return false;
      return roles.some(r => r.name === role && r.is_active);
    };
  }, [roles]);

  const canEdit = useMemo(() => {
    return (resource: string): boolean => {
      return hasPermission(`${resource}.edit`) || hasPermission(`${resource}.*`) || hasPermission('*');
    };
  }, [hasPermission]);

  const canDelete = useMemo(() => {
    return (resource: string): boolean => {
      return hasPermission(`${resource}.delete`) || hasPermission(`${resource}.*`) || hasPermission('*');
    };
  }, [hasPermission]);

  const canCreate = useMemo(() => {
    return (resource: string): boolean => {
      return hasPermission(`${resource}.create`) || hasPermission(`${resource}.*`) || hasPermission('*');
    };
  }, [hasPermission]);

  const canView = useMemo(() => {
    return (resource: string): boolean => {
      return hasPermission(`${resource}.view`) || hasPermission(`${resource}.*`) || hasPermission('*');
    };
  }, [hasPermission]);

  const value: PermissionsContextType = {
    permissions,
    roles,
    hasPermission,
    hasRole,
    canEdit,
    canDelete,
    canCreate,
    canView,
    isLoading,
    error,
    refreshPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
