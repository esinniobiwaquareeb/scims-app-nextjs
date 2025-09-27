// ============================================================================
// MENU & NAVIGATION RELATED TYPES
// ============================================================================

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category_id?: string;
  title: string;
  description?: string;
  action: string;
  icon?: string;
  color?: string;
  bg_color?: string;
  business_type?: string;
  requires_feature?: string;
  user_roles?: string[];
  is_active?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}
