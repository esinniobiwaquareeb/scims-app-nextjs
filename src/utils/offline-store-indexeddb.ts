import { Country, Currency, Language } from '@/types';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Base interface for all entities
interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Specific entity interfaces
interface Business extends BaseEntity {
  name: string;
  description?: string;
  industry?: string;
  timezone?: string;
  subscription_status?: string;
  subscription_expires_at?: string;
  is_active?: boolean;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  business_type?: string;
  username?: string;
  slug?: string;
}

interface Store extends BaseEntity {
  business_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active?: boolean;
  currency_id?: string;
  language_id?: string;
  country_id?: string;
}

interface Product extends BaseEntity {
  store_id: string;
  category_id?: string;
  supplier_id?: string;
  business_id?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  brand_id?: string;
  image_url?: string;
  is_active?: boolean;
  total_sold?: number;
  total_revenue?: number;
  reorder_level?: number;
  is_public?: boolean;
  public_description?: string;
  public_images?: unknown[];
}

interface Category extends BaseEntity {
  business_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  color?: string;
}

interface Brand extends BaseEntity {
  business_id?: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}

interface Supplier extends BaseEntity {
  business_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

interface Customer extends BaseEntity {
  store_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  total_purchases?: number;
  last_purchase_at?: string;
  is_active?: boolean;
}

interface Staff extends BaseEntity {
  business_id: string;
  store_id?: string;
  user_id: string;
  role: string;
  is_active?: boolean;
}

interface Sale extends BaseEntity {
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  receipt_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  cash_received?: number;
  change_given?: number;
  status: string;
  notes?: string;
  transaction_date: string;
  payment_status?: string;
  receipt_printed?: boolean;
}

interface SaleItem extends BaseEntity {
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount?: number;
}

interface SavedCart extends BaseEntity {
  store_id: string;
  cashier_id: string;
  customer_id?: string;
  cart_name: string;
  cart_data: unknown;
}

interface BusinessSettings extends BaseEntity {
  business_id: string;
  tax_rate?: number;
  enable_tax?: boolean;
  discount_rate?: number;
  enable_discount?: boolean;
  allow_returns?: boolean;
  return_period_days?: number;
  enable_sounds?: boolean;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  receipt_header?: string;
  receipt_footer?: string;
  return_policy?: string;
  warranty_info?: string;
  terms_of_service?: string;
  privacy_policy?: string;
  business_type?: string;
  enable_stock_tracking?: boolean;
  enable_inventory_alerts?: boolean;
  enable_restock_management?: boolean;
  enable_recipe_management?: boolean;
  enable_service_booking?: boolean;
  enable_menu_management?: boolean;
  enable_ingredient_tracking?: boolean;
  enable_public_store?: boolean;
  store_theme?: string;
  store_banner_url?: string;
  store_description?: string;
  whatsapp_phone?: string;
  whatsapp_message_template?: string;
}

interface StoreSettings extends BaseEntity {
  store_id: string;
  tax_rate?: number;
  enable_tax?: boolean;
  discount_rate?: number;
  enable_discount?: boolean;
  allow_returns?: boolean;
  return_period_days?: number;
  enable_sounds?: boolean;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  receipt_header?: string;
  receipt_footer?: string;
  return_policy?: string;
  contact_person?: string;
  store_hours?: string;
  store_promotion_info?: string;
  custom_receipt_message?: string;
}

interface SyncQueueItem extends BaseEntity {
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: unknown;
  retry_count: number;
  last_attempt?: string;
  error_message?: string;
}

// Database schema for offline storage
interface OfflineDB extends DBSchema {
  // Core business data
  businesses: {
    key: string;
    value: Business;
    indexes: { 'by-id': string };
  };
  stores: {
    key: string;
    value: Store;
    indexes: { 'by-business-id': string; 'by-id': string };
  };
  products: {
    key: string;
    value: Product;
    indexes: { 'by-store-id': string; 'by-id': string; 'by-category': string };
  };
  categories: {
    key: string;
    value: Category;
    indexes: { 'by-business-id': string; 'by-id': string };
  };
  brands: {
    key: string;
    value: Brand;
    indexes: { 'by-business-id': string; 'by-id': string };
  };
  suppliers: {
    key: string;
    value: Supplier;
    indexes: { 'by-business-id': string; 'by-id': string };
  };
  customers: {
    key: string;
    value: Customer;
    indexes: { 'by-store-id': string; 'by-id': string };
  };
  staff: {
    key: string;
    value: Staff;
    indexes: { 'by-business-id': string; 'by-id': string };
  };
  
  // Sales and transactions
  sales: {
    key: string;
    value: Sale;
    indexes: { 'by-store-id': string; 'by-date': string; 'by-status': string };
  };
  sale_items: {
    key: string;
    value: SaleItem;
    indexes: { 'by-sale-id': string; 'by-product-id': string };
  };
  
  // Saved carts
  saved_carts: {
    key: string;
    value: SavedCart;
    indexes: { 'by-store-id': string; 'by-cashier-id': string };
  };
  
  // Settings and configuration
  business_settings: {
    key: string;
    value: BusinessSettings;
    indexes: { 'by-business-id': string };
  };
  store_settings: {
    key: string;
    value: StoreSettings;
    indexes: { 'by-store-id': string };
  };

  languages: {
    key: string;
    value: Language;
    indexes: { 'by-id': string };
  };

  currencies: {
    key: string;
    value: Currency;
    indexes: { 'by-id': string };
  };

  countries: {
    key: string;
    value: Country;
    indexes: { 'by-id': string };
  };

  // Sync queue for pending operations
  sync_queue: {
    key: string;
    value: {
      id: string;
      operation: 'create' | 'update' | 'delete';
      table: string;
      data: unknown;
      timestamp: number;
      retry_count: number;
      last_retry: number;
    };
    indexes: { 'by-table': string; 'by-timestamp': string; 'by-retry-count': string };
  };
  
  // Cache metadata
  cache_metadata: {
    key: string;
    value: {
      table: string;
      last_sync: number;
      version: number;
      checksum: string;
    };
    indexes: { 'by-table': string };
  };
}

class OfflineStoreIndexedDB {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private readonly DB_NAME = 'scims_offline_db';
  private readonly DB_VERSION = 1;
  private initPromise: Promise<void> | null = null;
  
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = this._init();
    return this.initPromise;
  }
  
  private async _init(): Promise<void> {
    try {
      // Clear existing database if it exists to ensure clean initialization
      try {
        await indexedDB.deleteDatabase(this.DB_NAME);
        console.log('Cleared existing IndexedDB database');
      } catch {
        // Database might not exist, which is fine
        console.log('No existing database to clear');
      }
      
      this.db = await openDB<OfflineDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
          console.log('Upgrading IndexedDB from version', oldVersion, 'to', newVersion);
          
          // Businesses
          if (!db.objectStoreNames.contains('businesses')) {
            const businessesStore = db.createObjectStore('businesses', { keyPath: 'id' });
            businessesStore.createIndex('by-id', 'id');
            console.log('Created businesses store');
          }
          
          // Stores
          if (!db.objectStoreNames.contains('stores')) {
            const storesStore = db.createObjectStore('stores', { keyPath: 'id' });
            storesStore.createIndex('by-business-id', 'business_id');
            storesStore.createIndex('by-id', 'id');
            console.log('Created stores store');
          }
          
          // Products
          if (!db.objectStoreNames.contains('products')) {
            const productsStore = db.createObjectStore('products', { keyPath: 'id' });
            productsStore.createIndex('by-store-id', 'store_id');
            productsStore.createIndex('by-id', 'id');
            productsStore.createIndex('by-category', 'category_id');
            console.log('Created products store');
          }
          
          // Categories
          if (!db.objectStoreNames.contains('categories')) {
            const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
            categoriesStore.createIndex('by-business-id', 'business_id');
            categoriesStore.createIndex('by-id', 'id');
            console.log('Created categories store');
          }
          
          // Brands
          if (!db.objectStoreNames.contains('brands')) {
            const brandsStore = db.createObjectStore('brands', { keyPath: 'id' });
            brandsStore.createIndex('by-business-id', 'business_id');
            brandsStore.createIndex('by-id', 'id');
            console.log('Created brands store');
          }
          
          // Suppliers
          if (!db.objectStoreNames.contains('suppliers')) {
            const suppliersStore = db.createObjectStore('suppliers', { keyPath: 'id' });
            suppliersStore.createIndex('by-business-id', 'business_id');
            suppliersStore.createIndex('by-id', 'id');
            console.log('Created suppliers store');
          }
          
          // Customers
          if (!db.objectStoreNames.contains('customers')) {
            const customersStore = db.createObjectStore('customers', { keyPath: 'id' });
            customersStore.createIndex('by-store-id', 'store_id');
            customersStore.createIndex('by-id', 'id');
            console.log('Created customers store');
          }
          
          // Staff
          if (!db.objectStoreNames.contains('staff')) {
            const staffStore = db.createObjectStore('staff', { keyPath: 'id' });
            staffStore.createIndex('by-business-id', 'business_id');
            staffStore.createIndex('by-id', 'id');
            console.log('Created staff store');
          }
          
          // Sales
          if (!db.objectStoreNames.contains('sales')) {
            const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
            salesStore.createIndex('by-store-id', 'store_id');
            salesStore.createIndex('by-date', 'transaction_date');
            salesStore.createIndex('by-status', 'status');
            console.log('Created sales store');
          }
          
          // Sale items
          if (!db.objectStoreNames.contains('sale_items')) {
            const saleItemsStore = db.createObjectStore('sale_items', { keyPath: 'id' });
            saleItemsStore.createIndex('by-sale-id', 'sale_id');
            saleItemsStore.createIndex('by-product-id', 'product_id');
            console.log('Created sale_items store');
          }
          
          // Saved carts
          if (!db.objectStoreNames.contains('saved_carts')) {
            const savedCartsStore = db.createObjectStore('saved_carts', { keyPath: 'id' });
            savedCartsStore.createIndex('by-store-id', 'store_id');
            savedCartsStore.createIndex('by-cashier-id', 'cashier_id');
            console.log('Created saved_carts store');
          }
          
          // Business settings
          if (!db.objectStoreNames.contains('business_settings')) {
            const businessSettingsStore = db.createObjectStore('business_settings', { keyPath: 'business_id' });
            businessSettingsStore.createIndex('by-business-id', 'business_id');
            console.log('Created business_settings store');
          }
          
          // Store settings
          if (!db.objectStoreNames.contains('store_settings')) {
            const storeSettingsStore = db.createObjectStore('store_settings', { keyPath: 'store_id' });
            storeSettingsStore.createIndex('by-store-id', 'store_id');
            console.log('Created store_settings store');
          }
          
          // Sync queue
          if (!db.objectStoreNames.contains('sync_queue')) {
            const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
            syncQueueStore.createIndex('by-table', 'table');
            syncQueueStore.createIndex('by-timestamp', 'timestamp');
            syncQueueStore.createIndex('by-retry-count', 'retry_count');
            console.log('Created sync_queue store');
          }
          
          // Cache metadata
          if (!db.objectStoreNames.contains('cache_metadata')) {
            const cacheStore = db.createObjectStore('cache_metadata', { keyPath: 'table' });
            cacheStore.createIndex('by-table', 'table');
            console.log('Created cache_metadata store');
          }
          
          // Languages
          if (!db.objectStoreNames.contains('languages')) {
            const languagesStore = db.createObjectStore('languages', { keyPath: 'id' });
            languagesStore.createIndex('by-id', 'id');
            console.log('Created languages store');
          }
          
          // Currencies
          if (!db.objectStoreNames.contains('currencies')) {
            const currenciesStore = db.createObjectStore('currencies', { keyPath: 'id' });
            currenciesStore.createIndex('by-id', 'id');
            console.log('Created currencies store');
          }
          
          // Countries
          if (!db.objectStoreNames.contains('countries')) {
            const countriesStore = db.createObjectStore('countries', { keyPath: 'id' });
            countriesStore.createIndex('by-id', 'id');
            console.log('Created countries store');
          }
          
          console.log('IndexedDB upgrade completed successfully');
        },
      });
      
      console.log('IndexedDB offline database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB offline database:', error);
      throw error;
    }
  }
  
  // Ensure database is initialized
  private async ensureInit(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }
  
  // Generic CRUD operations
  async get<T>(table: keyof OfflineDB, key: string): Promise<T | undefined> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await this.db.get(table as any, key) as T | undefined;
    } catch (error) {
      console.error(`Error getting data from table ${String(table)} with key ${key}:`, error);
      return undefined;
    }
  }
  
  async getAll<T>(table: keyof OfflineDB): Promise<T[]> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await this.db.getAll(table as any) as T[];
    } catch (error) {
      console.error(`Error getting all data from table ${String(table)}:`, error);
      return [];
    }
  }
  
  async getByIndex<T>(table: keyof OfflineDB, indexName: string, value: unknown): Promise<T[]> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transaction = this.db.transaction(table as any, 'readonly');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const store = transaction.objectStore(table as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = (store as any).index(indexName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await index.getAll(value as any) as T[];
    } catch (error) {
      console.error(`Error getting data by index ${indexName} from table ${String(table)}:`, error);
      // Return empty array if index doesn't exist or other error
      return [];
    }
  }
  
  async put<T>(table: keyof OfflineDB, value: T): Promise<IDBValidKey> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await this.db.put(table as any, value as any);
  }
  
  async putMany<T>(table: keyof OfflineDB, values: T[]): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = this.db.transaction(table as any, 'readwrite');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = tx.objectStore(table as any);
    for (const value of values) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await store.put(value as any);
    }
    await tx.done;
  }
  
  async delete(table: keyof OfflineDB, key: string): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.db.delete(table as any, key);
  }
  
  // Specific data operations
  async getProductsByStore(storeId: string): Promise<Product[]> {
    return await this.getByIndex('products', 'by-store-id', storeId);
  }
  
  async getCustomersByStore(storeId: string): Promise<Customer[]> {
    return await this.getByIndex('customers', 'by-store-id', storeId);
  }
  
  async getSalesByStore(storeId: string): Promise<Sale[]> {
    return await this.getByIndex('sales', 'by-store-id', storeId);
  }
  
  async getSavedCartsByStore(storeId: string): Promise<SavedCart[]> {
    return await this.getByIndex('saved_carts', 'by-store-id', storeId);
  }
  
  async getCategoriesByBusiness(businessId: string): Promise<Category[]> {
    return await this.getByIndex('categories', 'by-business-id', businessId);
  }
  
  async getBusinessSettings(businessId: string): Promise<BusinessSettings | undefined> {
    return await this.get('business_settings', businessId);
  }
  
  async getStoreSettings(storeId: string): Promise<StoreSettings | undefined> {
    return await this.get('store_settings', storeId);
  }

  // Language operations
  async getAllLanguages(): Promise<Language[]> {
    return await this.getAll('languages');
  }

  async getLanguageById(id: string): Promise<Language | undefined> {
    return await this.get('languages', id);
  }

  // Currency operations
  async getAllCurrencies(): Promise<Currency[]> {
    return await this.getAll('currencies');
  }

  async getCurrencyById(id: string): Promise<Currency | undefined> {
    return await this.get('currencies', id);
  }

  // Country operations
  async getAllCountries(): Promise<Country[]> {
    return await this.getAll('countries');
  }

  async getCountryById(id: string): Promise<Country | undefined> {
    return await this.get('countries', id);
  }
  
  // Cache data operations
  async cacheProducts(products: Product[], storeId: string): Promise<void> {
    // Clear existing products for this store
    const existingProducts = await this.getProductsByStore(storeId);
    for (const product of existingProducts) {
      await this.delete('products', product.id);
    }
    
    // Add new products
    await this.putMany('products', products);
    
    // Update cache metadata
    await this.updateCacheMetadata('products', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(products)
    });
  }
  
  async cacheCustomers(customers: Customer[], storeId: string): Promise<void> {
    // Clear existing customers for this store
    const existingCustomers = await this.getCustomersByStore(storeId);
    for (const customer of existingCustomers) {
      await this.delete('customers', customer.id);
    }
    
    // Add new customers
    await this.putMany('customers', customers);
    
    // Update cache metadata
    await this.updateCacheMetadata('customers', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(customers)
    });
  }
  
  async cacheSales(sales: Sale[], storeId: string): Promise<void> {
    // Clear existing sales for this store
    const existingSales = await this.getSalesByStore(storeId);
    for (const sale of existingSales) {
      await this.delete('sales', sale.id);
    }
    
    // Add new sales
    await this.putMany('sales', sales);
    
    // Update cache metadata
    await this.updateCacheMetadata('sales', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(sales)
    });
  }
  
  async cacheCategories(categories: Category[], businessId: string): Promise<void> {
    // Clear existing categories for this business
    const existingCategories = await this.getCategoriesByBusiness(businessId);
    for (const category of existingCategories) {
      await this.delete('categories', category.id);
    }
    
    // Add new categories
    await this.putMany('categories', categories);
    
    // Update cache metadata
    await this.updateCacheMetadata('categories', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(categories)
    });
  }
  
  async cacheBusinessSettings(settings: BusinessSettings): Promise<void> {
    await this.put('business_settings', settings);
    
    // Update cache metadata
    await this.updateCacheMetadata('business_settings', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(settings)
    });
  }
  
  async cacheStoreSettings(settings: StoreSettings): Promise<void> {
    await this.put('store_settings', settings);
    
    // Update cache metadata
    await this.updateCacheMetadata('store_settings', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(settings)
    });
  }

  // Cache languages
  async cacheLanguages(languages: Language[]): Promise<void> {
    // Clear existing languages
    await this.clearTable('languages');
    
    // Add new languages
    await this.putMany('languages', languages);
    
    // Update cache metadata
    await this.updateCacheMetadata('languages', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(languages)
    });
  }

  // Cache currencies
  async cacheCurrencies(currencies: Currency[]): Promise<void> {
    // Clear existing currencies
    await this.clearTable('currencies');
    
    // Add new currencies
    await this.putMany('currencies', currencies);
    
    // Update cache metadata
    await this.updateCacheMetadata('currencies', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(currencies)
    });
  }

  // Cache countries
  async cacheCountries(countries: Country[]): Promise<void> {
    // Clear existing countries
    await this.clearTable('countries');
    
    // Add new countries
    await this.putMany('countries', countries);
    
    // Update cache metadata
    await this.updateCacheMetadata('countries', {
      last_sync: Date.now(),
      version: 1,
      checksum: this.generateChecksum(countries)
    });
  }

  // Sync queue operations
  async addToSyncQueue(operation: {
    operation: 'create' | 'update' | 'delete';
    table: string;
    data: unknown;
  }): Promise<void> {
    const syncItem = {
      id: crypto.randomUUID(),
      ...operation,
      timestamp: Date.now(),
      retry_count: 0,
      last_retry: 0,
    };
    
    await this.put('sync_queue' as keyof OfflineDB, syncItem);
  }
  
  async getSyncQueueItems(table?: string): Promise<SyncQueueItem[]> {
    if (table) {
      return await this.getByIndex('sync_queue', 'by-table', table);
    }
    return await this.getAll('sync_queue');
  }
  
  async removeFromSyncQueue(id: string): Promise<void> {
    await this.delete('sync_queue', id);
  }
  
  async updateSyncQueueRetry(id: string, retryCount: number): Promise<void> {
    const item = await this.get('sync_queue', id) as SyncQueueItem;
    if (item) {
      item.retry_count = retryCount;
      item.last_retry = Date.now();
      await this.put('sync_queue', item);
    }
  }
  
  // Cache management
  async updateCacheMetadata(table: string, metadata: {
    last_sync: number;
    version: number;
    checksum: string;
  }): Promise<void> {
    await this.put('cache_metadata' as keyof OfflineDB, {
      table,
      ...metadata,
    });
  }
  
  async getCacheMetadata(table: string): Promise<unknown> {
    return await this.get('cache_metadata' as keyof OfflineDB, table);
  }
  
  // Check if data is fresh (less than 5 minutes old)
  async isDataFresh(table: string, maxAge: number = 5 * 60 * 1000): Promise<boolean> {
    const metadata = await this.getCacheMetadata(table);
    if (!metadata) return false;
    
    const age = Date.now() - (metadata as { last_sync: number }).last_sync;
    return age < maxAge;
  }
  
  // Generate simple checksum for data validation
  private generateChecksum(data: unknown): string {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }
  
  // Data integrity checks
  async validateDataIntegrity(table: string, expectedChecksum: string): Promise<boolean> {
    const metadata = await this.getCacheMetadata(table);
    if (!metadata) return false;
    return (metadata as { checksum: string }).checksum === expectedChecksum;
  }
  
  // Cleanup operations
  async clearTable(table: keyof OfflineDB): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = this.db.transaction(table as any, 'readwrite');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = tx.objectStore(table as any);
    await store.clear();
    await tx.done;
  }
  
  async clearAllData(): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');
    const tables: (keyof OfflineDB)[] = [
      'businesses', 'stores', 'products', 'categories', 'brands',
      'suppliers', 'customers', 'staff', 'sales', 'sale_items',
      'saved_carts', 'business_settings', 'store_settings',
      'languages', 'currencies', 'countries',
      'sync_queue', 'cache_metadata'
    ];
    
    for (const table of tables) {
      await this.clearTable(table);
    }
  }
  
  // Close database
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
  
  // Check if database is initialized
  isInitialized(): boolean {
    return this.db !== null;
  }
  
  // Debug method to inspect database contents
  async debugDatabase(): Promise<{
    products: Product[];
    customers: Customer[];
    sales: Sale[];
    categories: Category[];
    saved_carts: SavedCart[];
    business_settings: BusinessSettings[];
    store_settings: StoreSettings[];
    languages: Language[];
    currencies: Currency[];
    countries: Country[];
    sync_queue: SyncQueueItem[];
    cache_metadata: unknown[];
  }> {
    try {
      const products = await this.getAll('products');
      const customers = await this.getAll('customers');
      const sales = await this.getAll('sales');
      const categories = await this.getAll('categories');
      const savedCarts = await this.getAll('saved_carts');
      const businessSettings = await this.getAll('business_settings');
      const storeSettings = await this.getAll('store_settings');
      const languages = await this.getAll('languages');
      const currencies = await this.getAll('currencies');
      const countries = await this.getAll('countries');
      const syncQueue = await this.getAll('sync_queue');
      const cacheMetadata = await this.getAll('cache_metadata');
      
      return {
        products: products as Product[],
        customers: customers as Customer[],
        sales: sales as Sale[],
        categories: categories as Category[],
        saved_carts: savedCarts as SavedCart[],
        business_settings: businessSettings as BusinessSettings[],
        store_settings: storeSettings as StoreSettings[],
        languages: languages as Language[],
        currencies: currencies as Currency[],
        countries: countries as Country[],
        sync_queue: syncQueue as SyncQueueItem[],
        cache_metadata: cacheMetadata as unknown[]
      };
    } catch (error) {
      console.error('Failed to debug database:', error);
      throw error;
    }
  }
  
  // Method to get table count
  async getTableCount(table: keyof OfflineDB): Promise<number> {
    try {
      const items = await this.getAll(table);
      return items.length;
    } catch (error) {
      console.error(`Failed to get count for table ${table}:`, error);
      return 0;
    }
  }
}

// Export singleton instance
export const offlineStoreIndexedDB = new OfflineStoreIndexedDB();
export default offlineStoreIndexedDB;
