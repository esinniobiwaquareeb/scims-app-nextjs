import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, LogOut, Store, Building2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton, 
  onBack, 
  children 
}) => {
  const { user, logout, currentBusiness, currentStore, switchStore } = useAuth();

  // Function to handle store selection including "All Stores"
  const handleStoreChange = (value: string) => {
    if (value === 'all') {
      // Clear current store selection to show all stores combined
      switchStore('');
    } else {
      // Switch to specific store
      switchStore(value);
    }
  };



  const showStoreSelector = currentBusiness && 
    currentBusiness.stores && currentBusiness.stores.length > 0 &&
    (user?.role === 'business_admin' || user?.role === 'superadmin');

  return (
    <header className="bg-background shadow-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {showBackButton && onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="shrink-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {showStoreSelector && (
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border">
                <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select 
                  value={currentStore?.id || 'all'} 
                  onValueChange={handleStoreChange}
                >
                  <SelectTrigger className="border-0 shadow-none h-auto p-0 font-medium bg-transparent">
                    <SelectValue placeholder="Select Store">
                      <span className="truncate max-w-32 sm:max-w-none">
                        {currentStore?.name || (
                          <span className="flex items-center gap-2 text-blue-600">
                            <Building2 className="w-4 h-4" />
                            All Stores
                          </span>
                        )}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">All Stores</p>
                          <p className="text-sm text-muted-foreground">Combined view</p>
                        </div>
                      </div>
                    </SelectItem>
                    {currentBusiness.stores?.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-60">
                            {store.address}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Store display for store admins (read-only) */}
            {user?.role === 'store_admin' && currentStore && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                <Store className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-blue-700">
                  {currentStore.name}
                </span>
              </div>
            )}
            
            {children}
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user?.role?.replace('_', ' ')}
              </Badge>
              <Button variant="outline" onClick={() => logout()} size="sm">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};