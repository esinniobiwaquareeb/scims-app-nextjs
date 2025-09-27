// ============================================================================
// ACTIVITY & NOTIFICATION RELATED TYPES
// ============================================================================

export interface ActivityLog {
  id: string;
  user_id?: string;
  business_id?: string;
  store_id?: string;
  activity_type: string;
  category: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'system' | 'alert';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read?: boolean;
  store_id: string;
  business_id: string;
  created_at: string;
  updated_at: string;
}
