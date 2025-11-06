import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get exchange transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: transaction, error } = await supabase
      .from('exchange_transaction')
      .select(`
        *,
        customer:customer_id(id, name, phone, email),
        cashier:cashier_id(id, name, username),
        original_sale:original_sale_id(
          id,
          receipt_number,
          transaction_date,
          total_amount,
          items:sale_item(
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product:product_id(id, name, sku)
          )
        ),
        exchange_items:exchange_item(
          *,
          product:product_id(id, name, sku, barcode, price, stock_quantity),
          original_sale_item:original_sale_item_id(
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product:product_id(id, name, sku)
          )
        ),
        purchase_items:exchange_purchase_item(
          *,
          product:product_id(id, name, sku, barcode, price, stock_quantity)
        ),
        refunds:exchange_refund(
          *,
          processed_by_user:processed_by(id, name, username)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Exchange transaction not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching exchange transaction:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exchange transaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Error in GET /api/exchanges/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

