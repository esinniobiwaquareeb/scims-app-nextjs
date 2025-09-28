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

    // Fetch products with low stock for the business
    const { data: products, error } = await supabase
      .from('product')
      .select(`
        id,
        name,
        sku,
        stock_quantity,
        reorder_level,
        min_stock_level,
        cost,
        price,
        is_active,
        category:category_id(
          id,
          name
        ),
        supplier:supplier_id(
          id,
          name
        ),
        brand:brand_id(
          id,
          name
        )
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true });

    if (error) {
      console.error('Error fetching low stock products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch low stock products' },
        { status: 500 }
      );
    }

    // Filter products that are below their reorder level (same logic as ProductManagement)
    const lowStockProducts = (products || []).filter(product => 
      (product.stock_quantity || 0) <= (product.reorder_level || product.min_stock_level || 10)
    );

    // Also include all active products for restocking
    const allActiveProducts = (products || []).filter(product => product.is_active);

    return NextResponse.json({ 
      products: lowStockProducts,
      allProducts: allActiveProducts 
    });
  } catch (error) {
    console.error('Error in low stock products API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
