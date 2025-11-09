import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const businessId = searchParams.get('business_id');
    
    // If store_id is "All", we need business_id to fetch all stores
    if (storeId === 'All' && !businessId) {
      return NextResponse.json(
        { success: false, error: 'business_id is required when store_id is "All"' },
        { status: 400 }
      );
    }
    
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

    if (storeId && storeId !== 'All') {
      // Fetch products for a specific store
      query = query.eq('store_id', storeId);
    } else if (businessId) {
      // Fetch products for all stores in a business
      // This handles both cases: storeId === 'All' with businessId, or just businessId alone
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.store_id) {
      return NextResponse.json(
        { success: false, error: 'name and store_id are required' },
        { status: 400 }
      );
    }

    // Check for duplicate products in the same store (by name, SKU, or barcode)
    if (body.sku || body.name || body.barcode) {
      let duplicateQuery = supabase
        .from('product')
        .select('id, name, sku, barcode')
        .eq('store_id', body.store_id)
        .eq('is_active', true);

      const orConditions: string[] = [];
      if (body.sku && body.sku.trim() !== '') {
        orConditions.push(`sku.eq.${body.sku.trim()}`);
      }
      if (body.name && body.name.trim() !== '') {
        orConditions.push(`name.eq.${body.name.trim()}`);
      }
      if (body.barcode && body.barcode.trim() !== '') {
        orConditions.push(`barcode.eq.${body.barcode.trim()}`);
      }

      if (orConditions.length > 0) {
        duplicateQuery = duplicateQuery.or(orConditions.join(','));
      }

      const { data: duplicates } = await duplicateQuery;

      // Filter for exact matches
      const exactMatches = (duplicates || []).filter(product => {
        const skuMatch = body.sku && body.sku.trim() !== '' && product.sku?.trim() === body.sku.trim();
        const nameMatch = body.name && body.name.trim() !== '' && product.name?.trim() === body.name.trim();
        const barcodeMatch = body.barcode && body.barcode.trim() !== '' && product.barcode?.trim() === body.barcode.trim();
        return skuMatch || nameMatch || barcodeMatch;
      });

      if (exactMatches.length > 0) {
        return NextResponse.json(
          { success: false, error: `A product with the same ${exactMatches[0].sku === body.sku ? 'SKU' : exactMatches[0].name === body.name ? 'name' : 'barcode'} already exists in this store` },
          { status: 400 }
        );
      }
    }

    const productData = {
      name: body.name,
      price: body.price || 0,
      cost: body.cost || 0,
      sku: body.sku || '',
      barcode: body.barcode || '',
      description: body.description || '',
      public_description: body.public_description || '',
      stock_quantity: body.stock_quantity || 0,
      min_stock_level: body.min_stock_level || 0,
      reorder_level: body.reorder_level || 0,
      category_id: body.category_id || null,
      supplier_id: body.supplier_id || null,
      brand_id: body.brand_id || null,
      image_url: body.image_url || '',
      is_public: body.is_public || false,
      is_active: body.is_active !== undefined ? body.is_active : true,
      store_id: body.store_id,
      business_id: body.business_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: product, error } = await supabase
      .from('product')
      .insert(productData)
      .select(`
        *,
        category:category_id(id, name),
        supplier:supplier_id(id, name),
        brand:brand_id(id, name),
        store:store_id(id, name),
        business:business_id(id, name)
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
