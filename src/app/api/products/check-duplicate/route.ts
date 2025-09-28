import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// POST - Check for duplicate products in a store
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_id, sku, name, barcode } = body;

    if (!store_id) {
      return NextResponse.json(
        { success: false, error: 'store_id is required' },
        { status: 400 }
      );
    }

    if (!sku && !name && !barcode) {
      return NextResponse.json(
        { success: false, error: 'At least one of sku, name, or barcode is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('product')
      .select('id, name, sku, barcode, store_id')
      .eq('store_id', store_id)
      .eq('is_active', true);

    // Build OR conditions for duplicate checking
    const orConditions = [];
    if (sku) orConditions.push(`sku.eq.${sku}`);
    if (name) orConditions.push(`name.eq.${name}`);
    if (barcode) orConditions.push(`barcode.eq.${barcode}`);

    if (orConditions.length > 0) {
      query = query.or(orConditions.join(','));
    }

    const { data: existingProducts, error } = await query;

    if (error) {
      console.error('Error checking for duplicates:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to check for duplicates' },
        { status: 500 }
      );
    }

    // Check for exact matches
    const exactMatches = existingProducts?.filter(product => {
      const skuMatch = sku && product.sku === sku;
      const nameMatch = name && product.name === name;
      const barcodeMatch = barcode && product.barcode === barcode;
      
      return skuMatch || nameMatch || barcodeMatch;
    }) || [];

    return NextResponse.json({
      success: true,
      hasDuplicates: exactMatches.length > 0,
      duplicates: exactMatches,
      count: exactMatches.length
    });

  } catch (error) {
    console.error('Error in POST /api/products/check-duplicate:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
