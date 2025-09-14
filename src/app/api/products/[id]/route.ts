import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { checkDemoRestrictions, createDemoRestrictedResponse } from '@/utils/demoRestrictions';

// GET - Fetch specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: product, error } = await supabase
      .from('product')
      .select(`
        *,
        category:category_id(id, name),
        supplier:supplier_id(id, name),
        brand:brand_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch product' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productData = await request.json();

    // Filter out join fields that don't exist in the products table
    const {
      // categories,  // Not used in this update
      // suppliers,   // Not used in this update  
      // brands,      // Not used in this update
      ...updateFields
    } = productData;

    // Clean up foreign key fields - convert empty strings to null
    const cleanedUpdateFields = {
      ...updateFields,
      category_id: updateFields.category_id || null,
      supplier_id: updateFields.supplier_id || null,
      brand_id: updateFields.brand_id || null,
    };

    // First update the product with only the basic fields
    const { error: updateError } = await supabase
      .from('product')
      .update(cleanedUpdateFields)
      .eq('id', id);

    if (updateError) throw updateError;

    // Then fetch the updated product with all the join data
    const { data: product, error: fetchError } = await supabase
      .from('product')
      .select(`
        *,
        category!category_id(id, name),
        supplier!supplier_id(id, name),
        brand!brand_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update product' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user from request headers (assuming it's passed from middleware)
    const userHeader = request.headers.get('x-user');
    const user = userHeader ? JSON.parse(userHeader) : null;

    // Check demo restrictions
    const restriction = checkDemoRestrictions(user, 'delete');
    if (!restriction.allowed) {
      return createDemoRestrictedResponse(restriction.message!);
    }

    const { error } = await supabase
      .from('product')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete product' 
      },
      { status: 500 }
    );
  }
}
