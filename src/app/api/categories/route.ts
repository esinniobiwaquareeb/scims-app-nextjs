import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

interface CreateCategoryData {
  name: string;
  description?: string;
  business_id: string;
  is_active?: boolean;
}

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

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryData = await request.json();
    const { name, description, business_id, is_active = true } = body;

    // Validate required fields
    if (!name || !business_id) {
      return NextResponse.json(
        { success: false, error: 'Name and business_id are required' },
        { status: 400 }
      );
    }

    // Check if category with same name already exists for this business
    const { data: existingCategory, error: checkError } = await supabase
      .from('category')
      .select('id')
      .eq('business_id', business_id)
      .eq('name', name.trim())
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing category:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to validate category' },
        { status: 500 }
      );
    }

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    // Create the category
    const { data: newCategory, error: createError } = await supabase
      .from('category')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        business_id,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase error creating category:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        ...newCategory,
        product_count: 0
      }
    });

  } catch (error) {
    console.error('Create category API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
