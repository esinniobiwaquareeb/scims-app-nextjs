import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Verify business exists
    const { data: business, error: businessError } = await supabase
      .from('business')
      .select('id')
      .eq('id', businessId)
      .eq('is_active', true)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Get all available permissions from platform roles
    // This gives users the full range of permissions to choose from when creating custom roles
    const { data: platformRoles, error: platformError } = await supabase
      .from('platform_role')
      .select('permissions')
      .eq('is_active', true);

    if (platformError) {
      console.error('Error fetching platform roles:', platformError);
      return NextResponse.json(
        { error: 'Failed to fetch platform roles' },
        { status: 500 }
      );
    }

    // Extract all unique permissions from platform roles
    const uniquePermissions = new Set<string>();
    
    if (platformRoles && platformRoles.length > 0) {
      platformRoles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((permission: string) => {
            uniquePermissions.add(permission);
          });
        }
      });
    }

    // Also get permissions from business roles to include any custom permissions
    const { data: businessRoles, error: businessRolesError } = await supabase
      .from('role')
      .select('permissions')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (!businessRolesError && businessRoles) {
      businessRoles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((permission: string) => {
            uniquePermissions.add(permission);
          });
        }
      });
    }

    // Define permission metadata mapping
    const permissionMetadata: Record<string, { name: string; description: string; category: string }> = {
      // Business Management
      'business.*': { name: 'Business Management', description: 'Full business administration', category: 'Business' },
      'business:read': { name: 'View Business', description: 'View business information and settings', category: 'Business' },
      'business:write': { name: 'Edit Business', description: 'Edit business information and settings', category: 'Business' },

      // Store Management
      'store.*': { name: 'Store Management', description: 'Full store administration', category: 'Stores' },
      'store.view': { name: 'View Stores', description: 'View store information', category: 'Stores' },
      'store:read': { name: 'View Stores', description: 'View store information', category: 'Stores' },
      'store:write': { name: 'Edit Stores', description: 'Edit store information', category: 'Stores' },

      // Product Management
      'product.*': { name: 'Product Management', description: 'Full product administration', category: 'Inventory' },
      'product:read': { name: 'View Products', description: 'View product information', category: 'Inventory' },
      'product:write': { name: 'Edit Products', description: 'Edit product information', category: 'Inventory' },

      // User Management
      'user.*': { name: 'User Management', description: 'Full user administration', category: 'Users' },
      'user.view': { name: 'View Users', description: 'View user information', category: 'Users' },
      'user:read': { name: 'View Users', description: 'View user information', category: 'Users' },
      'user:write': { name: 'Edit Users', description: 'Edit user information', category: 'Users' },

      // Sales Management
      'sale.*': { name: 'Sales Management', description: 'Full sales administration', category: 'Sales' },
      'sale:read': { name: 'View Sales', description: 'View sales information', category: 'Sales' },
      'sale:write': { name: 'Edit Sales', description: 'Edit sales transactions', category: 'Sales' },

      // Customer Management
      'customer:read': { name: 'View Customers', description: 'View customer information', category: 'Sales' },
      'customer:write': { name: 'Edit Customers', description: 'Edit customer information', category: 'Sales' },

      // Reports & Analytics
      'report.*': { name: 'Reports & Analytics', description: 'Full reporting access', category: 'Analytics' },
      'report.view': { name: 'View Reports', description: 'View business reports', category: 'Analytics' },
      'report:read': { name: 'View Reports', description: 'View business reports', category: 'Analytics' },

      // Settings Management
      'setting.*': { name: 'Settings Management', description: 'Full settings administration', category: 'System' },
      'settings:read': { name: 'View Settings', description: 'View system settings', category: 'System' },
      'settings:write': { name: 'Edit Settings', description: 'Edit system settings', category: 'System' },

      // Role Management
      'roles.*': { name: 'Role Management', description: 'Full role administration', category: 'Users' },

      // Staff Management
      'staff.*': { name: 'Staff Management', description: 'Full staff administration', category: 'Users' },

      // Categories Management
      'categories.*': { name: 'Categories Management', description: 'Full categories administration', category: 'Inventory' },

      // Cashier Management
      'cashier.*': { name: 'Cashier Management', description: 'Full cashier operations', category: 'Sales' },

      // All Permissions
      '*': { name: 'All Permissions', description: 'Full system access', category: 'System' }
    };

    // Convert unique permissions to the expected format
    const permissions = Array.from(uniquePermissions).map(permissionId => {
      const metadata = permissionMetadata[permissionId] || {
        name: permissionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Permission: ${permissionId}`,
        category: 'System'
      };

      return {
        id: permissionId,
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        business_id: businessId,
        is_active: true
      };
    });

    return NextResponse.json({
      success: true,
      permissions
    });

  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}