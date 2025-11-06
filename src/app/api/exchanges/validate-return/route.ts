import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import type { ValidateReturnData, ValidateReturnResponse } from '@/types/exchange';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Validate if item can be returned
export async function POST(request: NextRequest) {
  try {
    const data: ValidateReturnData = await request.json();

    // Must provide either receipt_number or sale_id
    if (!data.receipt_number && !data.sale_id) {
      return NextResponse.json(
        { success: false, error: 'Either receipt_number or sale_id is required' },
        { status: 400 }
      );
    }

    let saleQuery = supabase
      .from('sale')
      .select(`
        id,
        receipt_number,
        transaction_date,
        customer_id,
        total_amount,
        status,
        items:sale_item(
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          product:product_id(
            id,
            name,
            sku,
            barcode
          )
        )
      `);

    if (data.sale_id) {
      saleQuery = saleQuery.eq('id', data.sale_id);
    } else if (data.receipt_number) {
      saleQuery = saleQuery.eq('receipt_number', data.receipt_number);
    }

    const { data: sale, error: saleError } = await saleQuery.single();

    if (saleError || !sale) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Sale not found'
      } as ValidateReturnResponse);
    }

    // Check if sale is already refunded
    if (sale.status === 'refunded') {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'This sale has already been refunded'
      } as ValidateReturnResponse);
    }

    // Check if sale is cancelled
    if (sale.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Cannot return items from a cancelled sale'
      } as ValidateReturnResponse);
    }

    // If product_id is provided, check if it exists in the sale
    if (data.product_id) {
      const itemExists = sale.items?.some(
        (item: { product_id: string }) => item.product_id === data.product_id
      );

      if (!itemExists) {
        return NextResponse.json({
          success: true,
          valid: false,
          error: 'Product not found in this sale'
        } as ValidateReturnResponse);
      }

      // Check quantity if provided
      if (data.quantity) {
        const saleItem = sale.items?.find(
          (item: { product_id: string; quantity: number }) => item.product_id === data.product_id
        );

        if (saleItem && data.quantity > saleItem.quantity) {
          return NextResponse.json({
            success: true,
            valid: false,
            error: `Cannot return more than ${saleItem.quantity} items. Only ${saleItem.quantity} were purchased.`
          } as ValidateReturnResponse);
        }
      }
    }

    // Check for existing returns for this sale
    const { data: existingReturns } = await supabase
      .from('exchange_transaction')
      .select('id, status')
      .eq('original_sale_id', sale.id)
      .in('status', ['pending', 'completed']);

    // Transform sale items to match ValidateReturnResponse type
    const transformedItems = (sale.items || []).map((item: {
      id: string;
      product_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      product?: { name?: string } | Array<{ name?: string }>;
    }) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: Array.isArray(item.product) 
        ? item.product[0]?.name || 'Unknown Product'
        : (item.product as { name?: string })?.name || 'Unknown Product',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    return NextResponse.json({
      success: true,
      valid: true,
      sale: {
        id: sale.id,
        receipt_number: sale.receipt_number,
        transaction_date: sale.transaction_date,
        customer_id: sale.customer_id,
        items: transformedItems
      },
      existing_returns: existingReturns || []
    } as ValidateReturnResponse);

  } catch (error) {
    console.error('Error in POST /api/exchanges/validate-return:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

