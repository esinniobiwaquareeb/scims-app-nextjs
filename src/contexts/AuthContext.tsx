'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, Business, Store } from '@/types/auth';
import { authAPI } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  currentBusiness: Business | null;
  currentStore: Store | null;
  businesses: Business[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: (redirectToLogin?: () => void) => void;
  switchStore: (storeId: string) => void;
  refreshStores: () => Promise<void>;
  isLoading: boolean;
  loadBusinessData: (userId: string) => Promise<{ business: Business; store: Store | null } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize business creation to prevent infinite loops
  const createBusinessObject = useCallback((businessId: string, stores: Store[], createdAt?: string, timezone?: string) => {
    return {
      id: businessId,
      name: 'Current Business',
      subscription_status: 'active',
      stores: stores,
      createdAt: createdAt || new Date().toISOString(),
      timezone: timezone || 'UTC'
    };
  }, []);

  // Function to manually load business and store data
  const loadBusinessData = useCallback(async (userId: string) => {
    if (!userId || userId === '') return null;
    
    try {
      const businessResponse = await fetch(`/api/auth/user-business?user_id=${userId}`);
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        if (businessData.success && businessData.data) {
          const { business, store, allStores } = businessData.data;
          
          // Create business object with all stores for business_admin users
          const businessObj = {
            id: business.id,
            name: business.name,
            subscription_status: business.subscription_status,
            language_id: business.language_id,
            currency_id: business.currency_id,
            timezone: business.timezone || 'UTC',
            stores: allStores && allStores.length > 0 ? allStores : (store ? [store] : []),
            createdAt: new Date().toISOString()
          };
          
          setCurrentBusiness(businessObj);
          setBusinesses([businessObj]);
          
          // Set current store if user has one
          if (store) {
            setCurrentStore(store);
          }
          

          return { business: businessObj, store };
        }
      }
    } catch (businessError) {
      console.error('Error loading business data:', businessError);
    }
    return null;
  }, []);

  // Load business data when user is available but currentStore is null
  // Only run this effect once when the component mounts and user is available
  useEffect(() => {
    if (user && !currentStore && user.role !== 'superadmin') {
      loadBusinessData(user.id);
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object or currentStore

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check if we have stored auth data
        const storedUser = authAPI.getStoredUser();
        
        if (storedUser) {
          setUser(storedUser);
          
                  // Load businesses if user has access
        if (storedUser.role === 'superadmin') {
          // For superadmin, we'll load businesses later when needed
          setBusinesses([]);
        } else {
          // For business users, fetch their business and store data
          try {
            const businessResponse = await fetch(`/api/auth/user-business?user_id=${storedUser.id}`);
            if (businessResponse.ok) {
              const businessData = await businessResponse.json();
              if (businessData.success && businessData.data) {
                const { business, store, allStores } = businessData.data;
                
                // Create business object with all stores for business_admin users
                const businessObj = {
                  id: business.id,
                  name: business.name,
                  subscription_status: business.subscription_status,
                  language_id: business.language_id,
                  currency_id: business.currency_id,
                  timezone: business.timezone || 'UTC',
                  stores: allStores && allStores.length > 0 ? allStores : (store ? [store] : []),
                  createdAt: new Date().toISOString()
                };
                
                setCurrentBusiness(businessObj);
                setBusinesses([businessObj]);
                
                // Set current store if user has one
                if (store) {
                  setCurrentStore(store);
                }
              }
            }
          } catch (businessError) {
            console.error('Error loading business data on init:', businessError);
          }
        }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [createBusinessObject]);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(username, password);
      
      if (response.success && response.user) {
        const userData = response.user;
        setUser(userData);
        
        // Store user data
        authAPI.storeUser(userData);
        
        // Load business and store data based on user role
        if (userData.role === 'superadmin') {
          // For superadmin, we'll load businesses later when needed
          setBusinesses([]);
        } else {
          // For business users, fetch their business and store data
          try {
            const businessResponse = await fetch(`/api/auth/user-business?user_id=${userData.id}`);
            if (businessResponse.ok) {
              const businessData = await businessResponse.json();
              if (businessData.success && businessData.data) {
                const { business, store, allStores } = businessData.data;
                
                // Create business object with all stores for business_admin users
                const businessObj = {
                  id: business.id,
                  name: business.name,
                  subscription_status: business.subscription_status,
                  language_id: business.language_id,
                  currency_id: business.currency_id,
                  timezone: business.timezone || 'UTC',
                  stores: allStores && allStores.length > 0 ? allStores : (store ? [store] : []),
                  createdAt: new Date().toISOString()
                };
                
                setCurrentBusiness(businessObj);
                setBusinesses([businessObj]);
                
                // Set current store if user has one
                if (store) {
                  setCurrentStore(store);
                }
              }
            }
          } catch (businessError) {
            console.error('Error loading business data:', businessError);
          }
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (redirectToLogin?: () => void) => {
    await authAPI.logout();
    setUser(null);
    setCurrentBusiness(null);
    setCurrentStore(null);
    setBusinesses([]);
    
    // Redirect to login if callback provided
    if (redirectToLogin) {
      redirectToLogin();
    }
  }, []);

  const switchStore = useCallback(async (storeId: string) => {
    if (currentBusiness) {
      if (storeId === '' || storeId === 'all') {
        setCurrentStore(null);
        
        if (user) {
          const updatedUser = { ...user, storeId: undefined };
          setUser(updatedUser);
          authAPI.storeUser(updatedUser);
        }
      } else {
        const store = currentBusiness.stores.find((s: Store) => s.id === storeId);
        if (store && user) {
          setCurrentStore(store);
          
          const updatedUser = { ...user, storeId: storeId };
          setUser(updatedUser);
          authAPI.storeUser(updatedUser);
        }
      }
    }
  }, [currentBusiness, user]);

  const refreshStores = useCallback(async () => {
    // This will be implemented when we add store management API routes
    console.log('Store refresh not implemented yet');
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user, 
    currentBusiness, 
    currentStore, 
    businesses, 
    login, 
    logout, 
    switchStore, 
    refreshStores,
    isLoading,
    loadBusinessData
  }), [
    user, 
    currentBusiness, 
    currentStore, 
    businesses, 
    login, 
    logout, 
    switchStore, 
    refreshStores,
    isLoading,
    loadBusinessData
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
