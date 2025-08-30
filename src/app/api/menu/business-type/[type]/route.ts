import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Type definitions for menu data
interface MenuCategory {
  id: string;
  name: string;
  description: string;
}

interface MenuItem {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  color: string;
  bg_color: string;
  business_type: string;
  requires_feature: string | null;
  user_roles: string[];
  sort_order: number;
  is_active: boolean;
  category_id: string;
  menu_categories: MenuCategory[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    if (!type) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    // Fetch business type menu configuration
    const { data: businessTypeMenu, error: businessTypeError } = await supabase
      .from('business_type_menus')
      .select(`
        id,
        business_type,
        name,
        description,
        icon,
        color,
        bg_color
      `)
      .eq('business_type', type)
      .single();

    if (businessTypeError && businessTypeError.code !== 'PGRST116') {
      console.error('Supabase error:', businessTypeError);
      return NextResponse.json(
        { error: 'Failed to fetch business type menu' },
        { status: 500 }
      );
    }

    // Fetch menu items for this business type
    const { data: menuItems, error: itemsError } = await supabase
      .from('menu_items')
      .select(`
        id,
        title,
        description,
        action,
        icon,
        color,
        bg_color,
        business_type,
        requires_feature,
        user_roles,
        sort_order,
        is_active,
        category_id,
        menu_categories!inner(
          id,
          name,
          description
        )
      `)
      .eq('business_type', type)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      console.error('Supabase error:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedItems = menuItems?.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      action: item.action,
      icon: item.icon,
      color: item.color,
      bg_color: item.bg_color,
      business_type: item.business_type,
      requires_feature: item.requires_feature,
      user_roles: item.user_roles || [],
      sort_order: item.sort_order,
      is_active: item.is_active,
      category_id: item.category_id,
      category: item.menu_categories[0] // Take the first category since it's a 1:1 relationship
    })) || [];

    // Group items by category
    const itemsByCategory = transformedItems.reduce((acc, item) => {
      const categoryName = item.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {} as Record<string, typeof transformedItems>);

    const menu = {
      businessType: businessTypeMenu || {
        business_type: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        description: `${type} business configuration`,
        icon: 'Building2',
        color: 'text-gray-600',
        bg_color: 'bg-gray-50'
      },
      items: transformedItems,
      itemsByCategory
    };

    return NextResponse.json({
      success: true,
      menu
    });

  } catch (error) {
    console.error('Error fetching business type menu:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
