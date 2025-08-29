// Business Type Constants - Centralized for the entire application
export const BUSINESS_TYPES = {
  RETAIL: 'retail',
  RESTAURANT: 'restaurant',
  SERVICE: 'service',
  HYBRID: 'hybrid',
  PHARMACY: 'pharmacy'
} as const;

export const BUSINESS_TYPE_LABELS = {
  [BUSINESS_TYPES.RETAIL]: 'Retail Store',
  [BUSINESS_TYPES.RESTAURANT]: 'Restaurant/Eatery',
  [BUSINESS_TYPES.SERVICE]: 'Service Business',
  [BUSINESS_TYPES.HYBRID]: 'Hybrid Business',
  [BUSINESS_TYPES.PHARMACY]: 'Pharmacy/Healthcare'
} as const;

export const BUSINESS_TYPE_DESCRIPTIONS = {
  [BUSINESS_TYPES.RETAIL]: 'Traditional retail with inventory management',
  [BUSINESS_TYPES.RESTAURANT]: 'Food service with menu management',
  [BUSINESS_TYPES.SERVICE]: 'Service-based business with no inventory',
  [BUSINESS_TYPES.HYBRID]: 'Mix of products and services',
  [BUSINESS_TYPES.PHARMACY]: 'Healthcare/pharmacy with specialized inventory'
} as const;

export const BUSINESS_TYPE_FEATURES = {
  [BUSINESS_TYPES.RETAIL]: {
    stockTracking: true,
    inventoryAlerts: true,
    restockManagement: true,
    recipeManagement: false,
    serviceBooking: false,
    menuManagement: false,
    ingredientTracking: false,
    posFeatures: ['products', 'inventory', 'sales', 'reports'],
    dashboardFeatures: ['sales', 'inventory', 'reports', 'analytics']
  },
  [BUSINESS_TYPES.RESTAURANT]: {
    stockTracking: false,
    inventoryAlerts: false,
    restockManagement: false,
    recipeManagement: true,
    serviceBooking: false,
    menuManagement: true,
    ingredientTracking: true,
    posFeatures: ['menu', 'orders', 'tables', 'kitchen'],
    dashboardFeatures: ['orders', 'menu', 'kitchen', 'analytics']
  },
  [BUSINESS_TYPES.SERVICE]: {
    stockTracking: false,
    inventoryAlerts: false,
    restockManagement: false,
    recipeManagement: false,
    serviceBooking: true,
    menuManagement: false,
    ingredientTracking: false,
    posFeatures: ['services', 'appointments', 'clients', 'billing'],
    dashboardFeatures: ['appointments', 'services', 'clients', 'analytics']
  },
  [BUSINESS_TYPES.HYBRID]: {
    stockTracking: true,
    inventoryAlerts: true,
    restockManagement: true,
    recipeManagement: true,
    serviceBooking: true,
    menuManagement: true,
    ingredientTracking: true,
    posFeatures: ['products', 'services', 'menu', 'appointments'],
    dashboardFeatures: ['sales', 'services', 'inventory', 'analytics']
  },
  [BUSINESS_TYPES.PHARMACY]: {
    stockTracking: true,
    inventoryAlerts: true,
    restockManagement: true,
    recipeManagement: false,
    serviceBooking: false,
    menuManagement: false,
    ingredientTracking: false,
    posFeatures: ['products', 'prescriptions', 'inventory', 'reports'],
    dashboardFeatures: ['prescriptions', 'inventory', 'reports', 'analytics']
  }
} as const;

export const BUSINESS_TYPE_ICONS = {
  [BUSINESS_TYPES.RETAIL]: '🛍️',
  [BUSINESS_TYPES.RESTAURANT]: '🍽️',
  [BUSINESS_TYPES.SERVICE]: '🔧',
  [BUSINESS_TYPES.HYBRID]: '🔄',
  [BUSINESS_TYPES.PHARMACY]: '💊'
} as const;

export type BusinessType = typeof BUSINESS_TYPES[keyof typeof BUSINESS_TYPES];

export interface BusinessTypeConfig {
  type: BusinessType;
  label: string;
  description: string;
  features: typeof BUSINESS_TYPE_FEATURES[BusinessType];
  icon: string;
}

export const getBusinessTypeConfig = (type: BusinessType): BusinessTypeConfig => ({
  type,
  label: BUSINESS_TYPE_LABELS[type],
  description: BUSINESS_TYPE_DESCRIPTIONS[type],
  features: BUSINESS_TYPE_FEATURES[type],
  icon: BUSINESS_TYPE_ICONS[type]
});

export const isBusinessTypeEnabled = (
  businessType: BusinessType,
  feature: keyof typeof BUSINESS_TYPE_FEATURES[BusinessType]['features']
): boolean => {
  const config = getBusinessTypeConfig(businessType);
  return config.features[feature] || false;
};
