import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';


export async function GET(request: NextRequest) {
  try {
    // Fetch all menu categories
    const { data: categories, error } = await supabase
      .from('menu_categories')
      .select(`
        id,
        name,
        description,
        icon,
        color,
        bg_color,
        sort_order
      `)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch menu categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: categories || []
    });

  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
