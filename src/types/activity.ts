// ============================================================================
// ACTIVITY LOG SPECIFIC TYPES
// ============================================================================

// Import base types if needed in the future
// import { ActivityLog as BaseActivityLog } from './database';

// Extended activity log interface for UI display
export interface ActivityLogDisplay {
  id: string;
  timestamp: Date;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
  severity: SeverityLevel;
  businessName?: string;
  storeName?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

// Activity logs component props
export interface ActivityLogsProps {
  onBack: () => void;
}

// Activity log statistics
export interface ActivityLogStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byModule: Record<string, number>;
  byAction: Record<string, number>;
}

// Activity log filters
export interface ActivityLogFilters {
  searchTerm: string;
  selectedModule: string;
  selectedAction: string;
  selectedUser: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

// Activity log export options
export interface ActivityLogExportOptions {
  businessId: string;
  storeId?: string;
  module?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  format?: 'csv' | 'json' | 'xlsx';
}

// Severity levels
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

// Activity log table column
export interface ActivityLogColumn {
  key: string;
  label: string;
  render: (log: ActivityLogDisplay) => React.ReactNode;
}

// Activity log analytics data
export interface ActivityLogAnalytics {
  recentActivities: ActivityLogDisplay[];
  actionBreakdown: Array<{
    action: string;
    count: number;
  }>;
  moduleBreakdown: Array<{
    module: string;
    count: number;
  }>;
}
