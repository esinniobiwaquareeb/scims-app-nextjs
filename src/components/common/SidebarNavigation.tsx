'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/components/ui/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Tag,
  Package,
  FolderOpen,
  Truck,
  Users,
  UserCheck,
  Shield,
  FileText,
  Activity,
  Settings,
  Store,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles?: string[];
}

interface SidebarNavigationProps {
  className?: string;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ className }) => {
  const pathname = usePathname();
  const { user, currentBusiness, currentStore } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['dashboard', 'sales', 'inventory']));
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupTitle)) {
        next.delete(groupTitle);
      } else {
        next.add(groupTitle);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const hasAccess = (item: MenuItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  };

  // Business Admin Menu Groups
  const businessAdminMenuGroups: MenuGroup[] = [
    {
      title: 'dashboard',
      items: [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          roles: ['business_admin', 'store_admin']
        }
      ]
    },
    {
      title: 'sales',
      items: [
        {
          title: 'Point of Sale',
          href: '/pos',
          icon: ShoppingCart,
          roles: ['business_admin', 'store_admin', 'cashier']
        },
        {
          title: 'Sales Report',
          href: '/sales-report',
          icon: BarChart3,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Discounts & Promotions',
          href: '/discounts',
          icon: Tag,
          roles: ['business_admin', 'store_admin']
        }
      ]
    },
    {
      title: 'inventory',
      items: [
        {
          title: 'Products',
          href: '/products',
          icon: Package,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Categories',
          href: '/categories',
          icon: FolderOpen,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Brands',
          href: '/brands',
          icon: Tag,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Restock',
          href: '/restock',
          icon: Truck,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Product Sync',
          href: '/product-sync',
          icon: RotateCcw,
          roles: ['business_admin']
        },
        {
          title: 'Suppliers',
          href: '/suppliers',
          icon: Truck,
          roles: ['business_admin', 'store_admin']
        }
      ]
    },
    {
      title: 'people',
      items: [
        {
          title: 'Staff',
          href: '/staff',
          icon: Users,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Cashiers',
          href: '/cashiers',
          icon: UserCheck,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Customers',
          href: '/customers',
          icon: UserCheck,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Roles & Permissions',
          href: '/roles',
          icon: Shield,
          roles: ['business_admin']
        }
      ]
    },
    {
      title: 'reports',
      items: [
        {
          title: 'Reports',
          href: '/reports',
          icon: FileText,
          roles: ['business_admin', 'store_admin']
        },
        {
          title: 'Activity Logs',
          href: '/activity-logs',
          icon: Activity,
          roles: ['business_admin', 'store_admin']
        }
      ]
    },
    {
      title: 'settings',
      items: [
        {
          title: 'Stores',
          href: '/stores',
          icon: Store,
          roles: ['business_admin']
        },
        {
          title: 'Business Settings',
          href: '/business-settings',
          icon: Settings,
          roles: ['business_admin']
        },
        {
          title: 'Supply Management',
          href: '/supply-management',
          icon: RotateCcw,
          roles: ['business_admin', 'store_admin']
        }
      ]
    }
  ];

  // Store Admin Menu Groups (simplified)
  const storeAdminMenuGroups: MenuGroup[] = [
    {
      title: 'dashboard',
      items: [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: 'sales',
      items: [
        {
          title: 'Point of Sale',
          href: '/pos',
          icon: ShoppingCart
        },
        {
          title: 'Sales Report',
          href: '/sales-report',
          icon: BarChart3
        },
        {
          title: 'Discounts & Promotions',
          href: '/discounts',
          icon: Tag
        }
      ]
    },
    {
      title: 'inventory',
      items: [
        {
          title: 'Products',
          href: '/products',
          icon: Package
        },
        {
          title: 'Categories',
          href: '/categories',
          icon: FolderOpen
        },
        {
          title: 'Brands',
          href: '/brands',
          icon: Tag
        },
        {
          title: 'Restock',
          href: '/restock',
          icon: Truck
        },
        {
          title: 'Suppliers',
          href: '/suppliers',
          icon: Truck
        }
      ]
    },
    {
      title: 'people',
      items: [
        {
          title: 'Staff',
          href: '/staff',
          icon: Users
        },
        {
          title: 'Cashiers',
          href: '/cashiers',
          icon: UserCheck
        },
        {
          title: 'Customers',
          href: '/customers',
          icon: UserCheck
        }
      ]
    },
    {
      title: 'reports',
      items: [
        {
          title: 'Reports',
          href: '/reports',
          icon: FileText
        },
        {
          title: 'Activity Logs',
          href: '/activity-logs',
          icon: Activity
        }
      ]
    },
    {
      title: 'settings',
      items: [
        {
          title: 'Store Settings',
          href: '/stores',
          icon: Settings
        },
        {
          title: 'Supply Management',
          href: '/supply-management',
          icon: RotateCcw
        }
      ]
    }
  ];

  const menuGroups = user?.role === 'business_admin' ? businessAdminMenuGroups : storeAdminMenuGroups;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo/Brand Section */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-foreground truncate">SCIMS</h2>
            {currentStore ? (
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{currentStore.name}</p>
            ) : currentBusiness ? (
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{currentBusiness.name}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          {menuGroups.map((group) => {
            const groupHasActiveItem = group.items.some(item => 
              hasAccess(item) && isActive(item.href)
            );
            const isExpanded = expandedGroups.has(group.title);

            return (
              <div key={group.title} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                    "hover:bg-muted",
                    groupHasActiveItem && "bg-muted"
                  )}
                >
                  <span className="capitalize text-muted-foreground">{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1 border-l border-border pl-3 sm:pl-4">
                    {group.items
                      .filter(hasAccess)
                      .map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors",
                              "hover:bg-muted",
                              active && "bg-muted text-foreground font-medium"
                            )}
                          >
                            <Icon className={cn(
                              "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0",
                              active ? "text-brand-primary" : "text-muted-foreground"
                            )} />
                            <span className={cn(
                              "flex-1 truncate",
                              active ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-brand-primary/10 text-brand-primary rounded-full shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Positioned in header */}
      <div className="lg:hidden fixed top-2.5 left-2.5 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background h-8 w-8 shadow-sm border-border"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position on all screen sizes */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 sm:w-72 bg-background border-r border-border z-50",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

