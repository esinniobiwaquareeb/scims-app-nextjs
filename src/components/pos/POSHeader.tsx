import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystem } from '@/contexts/SystemContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Store, Building2, Maximize2, Minimize2, X, Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/utils/hooks/useOfflineData';

interface POSHeaderProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onBack: () => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({ 
  isFullscreen, 
  onToggleFullscreen, 
  onBack 
}) => {
  const { user, logout, currentBusiness, currentStore } = useAuth();
  const { translate } = useSystem();
  const { isOnline } = useNetworkStatus();

  return (
    <header className="bg-background shadow-sm border-b border-border sticky top-0 z-40 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex justify-between items-center py-4 gap-4">
          {/* Left Side - Title and Store Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                {translate('pos.title') || 'Point of Sale'}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                {currentStore ? `${currentStore.name} - ${user?.name}` : 'Process sales and manage transactions'}
              </p>
            </div>
          </div>

          {/* Center - Store Selector (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            {currentBusiness && currentBusiness.stores.length > 0 && user?.role !== 'cashier' && user?.role !== 'store_admin' && (
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border">
                <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select 
                  value={currentStore?.id || 'all'} 
                  onValueChange={(value) => {
                    if (value === 'all') {
                      // Handle all stores selection if needed
                    } else {
                      // Switch to specific store if needed
                    }
                  }}
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
                    {currentBusiness.stores.map((store: { id: string; name: string; address?: string }) => (
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
          </div>

          {/* Right Side - Actions and User Info */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Network Status Badge */}
            <Badge 
              variant={isOnline ? "default" : "destructive"} 
              className="hidden sm:inline-flex"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>

            {/* User Role Badge */}
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {user?.role?.replace('_', ' ')}
            </Badge>

            {/* Exit POS Button - More Pronounced */}
            <Button 
              onClick={onBack} 
              size="sm"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 font-semibold px-4"
            >
              <X className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Exit POS</span>
            </Button>

            {/* Fullscreen Toggle Button */}
            <Button
              onClick={onToggleFullscreen}
              variant="outline"
              size="sm"
              className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </Button>

            {/* Logout Button - Less Prominent */}
            <Button 
              variant="ghost" 
              onClick={() => logout()} 
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Store Selector - Below header on small screens */}
        <div className="lg:hidden pb-3">
          {/* Mobile Network Status */}
          <div className="mb-2">
            <Badge 
              variant={isOnline ? "default" : "destructive"} 
              className="w-full justify-center"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Online Mode
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline Mode - Sales will sync when online
                </>
              )}
            </Badge>
          </div>

          {currentBusiness && currentBusiness.stores.length > 0 && user?.role !== 'cashier' && user?.role !== 'store_admin' && (
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border">
              <Store className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select 
                value={currentStore?.id || 'all'} 
                onValueChange={(value) => {
                  if (value === 'all') {
                    // Handle all stores selection if needed
                  } else {
                    // Switch to specific store if needed
                  }
                }}
              >
                <SelectTrigger className="border-0 shadow-none h-auto p-0 font-medium bg-transparent">
                  <SelectValue placeholder="Select Store">
                    <span className="truncate">
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
                  {currentBusiness.stores.map((store: { id: string; name: string; address?: string }) => (
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
          
          {/* Mobile Store display for store admins (read-only) */}
          {user?.role === 'store_admin' && currentStore && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
              <Store className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-sm font-medium text-blue-700">
                {currentStore.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
