import { useQuery } from '@tanstack/react-query';

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  color: string;
  bg_color: string;
  business_type: string;
  requires_feature?: string;
  user_roles: string[];
  sort_order: number;
  category?: {
    name: string;
  };
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg_color: string;
  sort_order: number;
}

export interface BusinessTypeMenu {
  id: string;
  business_type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg_color: string;
}

export interface DashboardFeatures {
  overview: MenuItem[];
  menu: MenuItem[];
}

// Hook to fetch menu items for a specific business type and user role
export const useMenuItems = (businessType: string, userRole: string, enabledFeatures: string[] = []) => {
  return useQuery({
    queryKey: ['menu-items', businessType, userRole, enabledFeatures],
    queryFn: async (): Promise<DashboardFeatures> => {
      // TODO: Replace with API call when menu endpoints are implemented
      // For now, return empty arrays
      return { overview: [], menu: [] };
    },
    enabled: !!businessType && !!userRole,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch business type menu configuration
export const useBusinessTypeMenu = (businessType: string) => {
  return useQuery({
    queryKey: ['business-type-menu', businessType],
    queryFn: async (): Promise<BusinessTypeMenu | null> => {
      // TODO: Replace with API call when business type menu endpoints are implemented
      // For now, return null
      return null;
    },
    enabled: !!businessType,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Hook to fetch all menu categories
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menu-categories'],
    queryFn: async (): Promise<MenuCategory[]> => {
      // TODO: Replace with API call when menu categories endpoints are implemented
      // For now, return empty array
      return [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook to fetch all menu items (for admin management)
export const useAllMenuItems = () => {
  return useQuery({
    queryKey: ['all-menu-items'],
    queryFn: async (): Promise<MenuItem[]> => {
      // TODO: Replace with API call when all menu items endpoints are implemented
      // For now, return empty array
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
