import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const businessId = searchParams.get('business_id');
    
    if (!storeId && !businessId) {
      return NextResponse.json(
        { success: false, error: 'Either store_id or business_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('product')
      .select(`
        *,
        category:category_id(id, name),
        supplier:supplier_id(id, name),
        brand:brand_id(id, name),
        store:store_id(id, name)
      `)
      .eq('is_active', true);

    if (storeId) {
      // Fetch products for a specific store
      query = query.eq('store_id', storeId);
    } else if (businessId) {
      // Fetch products for all stores in a business
      // First get all stores for the business
      const { data: stores, error: storesError } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (storesError) {
        console.error('Error fetching stores:', storesError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch business stores' },
          { status: 500 }
        );
      }

      if (stores && stores.length > 0) {
        const storeIds = stores.map(store => store.id);
        query = query.in('store_id', storeIds);
      } else {
        // No stores found for this business
        return NextResponse.json({
          success: true,
          products: []
        });
      }
    }

    const { data: products, error } = await query.order('name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: products || []
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
