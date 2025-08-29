// Centralized configuration for all tables in the application
export const TABLE_CONFIG = {
  // Default pagination settings
  pagination: {
    enabled: true,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    showPageSizeSelector: true,
    showPageInfo: true,
    maxVisiblePages: 5
  },

  // Default search settings
  search: {
    enabled: true,
    placeholder: "Search...",
    debounceMs: 300
  },

  // Default table dimensions
  dimensions: {
    height: 600,
    minHeight: 400
  },

  // Default empty state messages
  emptyMessages: {
    default: "No data available",
    search: "No results found for your search",
    loading: "Loading data..."
  },

  // Role-based pagination settings
  roleBasedPagination: {
    superadmin: {
      pageSize: 50,
      pageSizeOptions: [25, 50, 100, 200]
    },
    business_admin: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    store_admin: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    cashier: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50]
    }
  },

  // Table-specific configurations
  tables: {
    activityLogs: {
      pageSize: 50,
      pageSizeOptions: [25, 50, 100, 200],
      maxVisiblePages: 7
    },
    products: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    customers: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    suppliers: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    brands: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    businesses: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    subscriptionPlans: {
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100]
    },
    staff: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    categories: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    cashiers: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    sales: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    reports: {
      pageSize: 15,
      pageSizeOptions: [10, 15, 25, 50]
    },
    superadmin: {
      pageSize: 10,
      pageSizeOptions: [5, 10, 20, 50]
    }
  }
};

// Helper function to get pagination config for a specific table
export const getTablePaginationConfig = (tableName?: keyof typeof TABLE_CONFIG.tables, userRole?: string) => {
  const baseConfig = TABLE_CONFIG.pagination;
  
  // Get table-specific overrides
  const tableConfig = tableName ? TABLE_CONFIG.tables[tableName] : {};
  
  // Get role-based overrides
  const roleConfig = userRole && userRole in TABLE_CONFIG.roleBasedPagination 
    ? TABLE_CONFIG.roleBasedPagination[userRole as keyof typeof TABLE_CONFIG.roleBasedPagination]
    : {};

  return {
    ...baseConfig,
    ...tableConfig,
    ...roleConfig
  };
};

// Helper function to get complete table config
export const getTableConfig = (tableName?: keyof typeof TABLE_CONFIG.tables, userRole?: string) => {
  return {
    pagination: getTablePaginationConfig(tableName, userRole),
    search: TABLE_CONFIG.search,
    dimensions: TABLE_CONFIG.dimensions,
    emptyMessages: TABLE_CONFIG.emptyMessages
  };
};
