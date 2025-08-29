import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const userId = searchParams.get('user_id');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user permissions using the same logic as direct-client.tsx
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_role')
      .select(`
        id,
        role_id,
        business_id,
        store_id,
        is_active,
        role:role_id(
          id,
          name,
          permissions,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (userRolesError) {
      console.error('Error fetching user roles:', userRolesError);
      return NextResponse.json(
        { error: 'Failed to fetch user roles' },
        { status: 500 }
      );
    }

    if (!userRoles || userRoles.length === 0) {
      return NextResponse.json([]);
    }

    // Extract permissions from all active roles
    const allPermissions: string[] = [];
    
    for (const userRole of userRoles) {
      const role = userRole.role as unknown as {
        id: string;
        name: string;
        permissions: string[] | string;
        is_active: boolean;
      };
      if (role && role.is_active && role.permissions) {
        // Handle JSONB permissions array
        if (Array.isArray(role.permissions)) {
          allPermissions.push(...role.permissions);
        } else if (typeof role.permissions === 'string') {
          allPermissions.push(role.permissions);
        }
      }
    }

    // Convert permissions to the format expected by the context
    const permissions = allPermissions.map(permId => {
      // Map permission IDs to human-readable names and categories
      const permissionMap: Record<string, { name: string; description: string; category: string }> = {
        'business.*': { name: 'Business Management', description: 'Full business administration', category: 'Business' },
        'store.*': { name: 'Store Management', description: 'Full store administration', category: 'Stores' },
        'product.*': { name: 'Product Management', description: 'Full product administration', category: 'Inventory' },
        'user.*': { name: 'User Management', description: 'Full user administration', category: 'Users' },
        'sale.*': { name: 'Sales Management', description: 'Full sales administration', category: 'Sales' },
        'report.*': { name: 'Reports & Analytics', description: 'Full reporting access', category: 'Analytics' },
        'setting.*': { name: 'Settings Management', description: 'Full settings administration', category: 'System' },
        'store.view': { name: 'View Stores', description: 'View store information', category: 'Stores' },
        'product.view': { name: 'View Products', description: 'View product information', category: 'Inventory' },
        'sale.create': { name: 'Create Sales', description: 'Create new sales transactions', category: 'Sales' },
        'sale.view': { name: 'View Sales', description: 'View sales information', category: 'Sales' },
        'user.view': { name: 'View Users', description: 'View user information', category: 'Users' },
        'report.view': { name: 'View Reports', description: 'View business reports', category: 'Analytics' },
        'customer.view': { name: 'View Customers', description: 'View customer information', category: 'Sales' },
        'customer.create': { name: 'Create Customers', description: 'Create new customers', category: 'Sales' },
        '*': { name: 'All Permissions', description: 'Full system access', category: 'System' }
      };

      const permInfo = permissionMap[permId] || {
        name: permId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Permission: ${permId}`,
        category: 'System'
      };

      return {
        id: permId,
        name: permInfo.name,
        description: permInfo.description,
        category: permInfo.category,
        business_id: businessId,
        is_active: true
      };
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
