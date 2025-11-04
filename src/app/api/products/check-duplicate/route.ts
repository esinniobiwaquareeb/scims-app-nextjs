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

    // Build OR conditions for duplicate checking using proper Supabase syntax
    let query = supabase
      .from('product')
      .select('id, name, sku, barcode, store_id')
      .eq('store_id', store_id)
      .eq('is_active', true);

    // Build OR conditions - Supabase OR syntax: "field1.eq.value1,field2.eq.value2"
    const orConditions: string[] = [];
    if (sku && sku.trim() !== '') {
      orConditions.push(`sku.eq.${sku.trim()}`);
    }
    if (name && name.trim() !== '') {
      orConditions.push(`name.eq.${name.trim()}`);
    }
    if (barcode && barcode.trim() !== '') {
      orConditions.push(`barcode.eq.${barcode.trim()}`);
    }

    if (orConditions.length > 0) {
      query = query.or(orConditions.join(','));
    } else {
      // If no valid conditions, return no duplicates
      return NextResponse.json({
        success: true,
        hasDuplicates: false,
        duplicates: [],
        count: 0
      });
    }

    const { data: existingProducts, error } = await query;

    if (error) {
      console.error('Error checking for duplicates:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to check for duplicates' },
        { status: 500 }
      );
    }

    // Filter for exact matches (handles case sensitivity and whitespace)
    const exactMatches = (existingProducts || []).filter(product => {
      const skuMatch = sku && sku.trim() !== '' && product.sku?.trim() === sku.trim();
      const nameMatch = name && name.trim() !== '' && product.name?.trim() === name.trim();
      const barcodeMatch = barcode && barcode.trim() !== '' && product.barcode?.trim() === barcode.trim();
      
      return skuMatch || nameMatch || barcodeMatch;
    });

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
