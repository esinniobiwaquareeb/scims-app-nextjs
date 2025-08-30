import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch all menu items with category information
    const { data: items, error } = await supabase
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
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch menu items' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedItems = items?.map(item => ({
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

    return NextResponse.json({
      success: true,
      items: transformedItems
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
