import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'business_id is required' },
        { status: 400 }
      );
    }

    // Fetch categories for the business with product counts
    const { data: categories, error } = await supabase
      .from('category')
      .select(`
        *,
        products:product(count)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Process categories to include product count
    const categoriesWithCounts = (categories || []).map(category => ({
      ...category,
      product_count: category.products?.[0]?.count || 0
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts
    });

  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
