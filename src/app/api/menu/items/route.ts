import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET() {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
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
      category_id
    } = body;

    // Validate required fields
    if (!title || !description || !action || !category_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, action, category_id' },
        { status: 400 }
      );
    }

    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from('menu_categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Invalid category_id' },
        { status: 400 }
      );
    }

    // Create the menu item
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        title,
        description,
        action,
        icon: icon || 'Package',
        color: color || 'text-blue-600',
        bg_color: bg_color || 'bg-blue-50',
        business_type: business_type || 'retail',
        requires_feature,
        user_roles: user_roles || ['business_admin'],
        sort_order: sort_order || 0,
        is_active: is_active !== false, // Default to true
        category_id
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create menu item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: data
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
