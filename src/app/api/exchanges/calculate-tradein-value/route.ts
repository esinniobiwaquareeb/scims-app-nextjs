import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import type { CalculateTradeInValueData, CalculateTradeInValueResponse } from '@/types/exchange';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Condition multipliers for valuation
const CONDITION_MULTIPLIERS: Record<string, number> = {
  excellent: 1.0,  // 100% of base value
  good: 0.85,      // 85% of base value
  fair: 0.65,      // 65% of base value
  damaged: 0.40,   // 40% of base value
  defective: 0.15  // 15% of base value
};

// POST - Calculate trade-in value
export async function POST(request: NextRequest) {
  try {
    const data: CalculateTradeInValueData = await request.json();

    if (!data.condition) {
      return NextResponse.json(
        { success: false, error: 'Condition is required' },
        { status: 400 }
      );
    }

    if (!CONDITION_MULTIPLIERS[data.condition]) {
      return NextResponse.json(
        { success: false, error: 'Invalid condition. Must be: excellent, good, fair, damaged, or defective' },
        { status: 400 }
      );
    }

    let baseValue = 0;
    let notes = '';

    // If product_id is provided, get its current price as base value
    if (data.product_id) {
      const { data: product, error: productError } = await supabase
        .from('product')
        .select('id, name, price, cost')
        .eq('id', data.product_id)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      // Use cost price if available, otherwise use 70% of selling price as base
      baseValue = product.cost || (product.price * 0.7);
      notes = `Based on product: ${product.name}`;
    }
    // If estimated_value is provided, use it
    else if (data.estimated_value) {
      baseValue = data.estimated_value;
      notes = 'Based on estimated value provided';
    }
    // If product_name is provided but no product_id, try to find similar product
    else if (data.product_name) {
      const { data: similarProducts } = await supabase
        .from('product')
        .select('id, name, price, cost')
        .ilike('name', `%${data.product_name}%`)
        .limit(1);

      if (similarProducts && similarProducts.length > 0) {
        const product = similarProducts[0];
        baseValue = product.cost || (product.price * 0.7);
        notes = `Estimated based on similar product: ${product.name}`;
      } else {
        return NextResponse.json(
          { success: false, error: 'Cannot determine base value. Please provide estimated_value or product_id' },
          { status: 400 }
        );
      }
    }
    // If no base value can be determined
    else {
      return NextResponse.json(
        { success: false, error: 'Cannot calculate value. Please provide product_id, estimated_value, or product_name' },
        { status: 400 }
      );
    }

    // Calculate trade-in value
    const multiplier = CONDITION_MULTIPLIERS[data.condition];
    const unitValue = baseValue * multiplier;

    // Round to 2 decimal places
    const roundedValue = Math.round(unitValue * 100) / 100;

    return NextResponse.json({
      success: true,
      unit_value: roundedValue,
      condition_multiplier: multiplier,
      base_value: baseValue,
      notes: notes || `Condition: ${data.condition} (${(multiplier * 100).toFixed(0)}% of base value)`
    } as CalculateTradeInValueResponse);

  } catch (error) {
    console.error('Error in POST /api/exchanges/calculate-tradein-value:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

