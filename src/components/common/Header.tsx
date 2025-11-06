import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, LogOut, Store, Building2, User, Settings } from 'lucide-react';
import { UserProfileModal } from './UserProfileModal';
import { UserSettingsModal } from './UserSettingsModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  showLogout?: boolean;
  simplified?: boolean; // Simplified mode for detail pages - only shows back button, title, and subtitle
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton, 
  onBack, 
  showLogout = true,
  simplified = false,
  children 
}) => {
  const { user, logout, currentBusiness, currentStore, switchStore } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleStoreChange = (value: string) => {
    if (value === 'all') {
      switchStore('');
    } else {
      switchStore(value);
    }
  };

  const showStoreSelector = !simplified && currentBusiness && 
    currentBusiness.stores.length > 0 &&
    (user?.role === 'business_admin' || user?.role === 'admin');

  return (
    <header className="bg-background shadow-sm border-b border-border fixed top-0 left-0 right-0 lg:left-64 xl:left-72 z-40">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between py-2.5 sm:py-3 lg:py-4 gap-2 sm:gap-3 lg:gap-4">
          {/* Left Section - Title */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 pl-9 lg:pl-0">
            {showBackButton && onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="shrink-0 hidden sm:flex">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-foreground truncate leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate hidden sm:block mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Section - Store Selector, Actions, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
            {/* Store Selector - Hidden on very small screens */}
            {showStoreSelector && (
              <div className="hidden sm:flex items-center gap-2 sm:gap-3 lg:gap-4 bg-muted rounded-lg px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 border border-border">
                <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select 
                  value={currentStore?.id || 'all'} 
                  onValueChange={handleStoreChange}
                >
                  <SelectTrigger className="border-0 shadow-none h-auto p-0 font-medium bg-transparent w-auto min-w-0">
                    <SelectValue placeholder="Select Store">
                      <span className="truncate max-w-[100px] lg:max-w-none">
                        {currentStore?.name || (
                          <span className="flex items-center gap-1.5 sm:gap-2">
                            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden lg:inline">All Stores</span>
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
                    {currentBusiness.stores.map(store => (
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

            {/* Store display for store admins - Hidden on mobile */}
            {!simplified && user?.role === 'store_admin' && currentStore && (
              <div className="hidden sm:flex items-center gap-2 sm:gap-3 lg:gap-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 border border-blue-200 dark:border-blue-800">
                <Store className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate max-w-[120px] lg:max-w-none">
                  {currentStore.name}
                </span>
              </div>
            )}
            
            {/* Header Actions */}
            {!simplified && (
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
                {children}
              </div>
            )}
            
            {/* Profile Dropdown */}
            {!simplified && showLogout && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-2 sm:gap-3 lg:gap-4 rounded-md px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 border border-border hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shrink-0"
                    aria-label="User menu"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-xs sm:text-sm font-medium text-foreground leading-tight">
                        {user.name || user.username}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground capitalize leading-tight">
                        {user.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email || user.username}
                      </p>
              </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettingsModal(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    variant="destructive"
                    onClick={async () => {
                      await logout();
                      // Force a hard redirect to clear all client-side state and ensure proper logout
                      window.location.href = '/auth/login';
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal} 
      />

      {/* Settings Modal */}
      <UserSettingsModal 
        open={showSettingsModal} 
        onOpenChange={setShowSettingsModal} 
      />
    </header>
  );
};
