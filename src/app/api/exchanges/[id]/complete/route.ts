import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import type { CompleteExchangeTransactionData } from '@/types/exchange';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Complete exchange transaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data: CompleteExchangeTransactionData = await request.json();

    // Get current transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('exchange_transaction')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Exchange transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Transaction is already completed' },
        { status: 400 }
      );
    }

    if (transaction.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Cannot complete a cancelled transaction' },
        { status: 400 }
      );
    }

    // Get user ID from headers
    const userId = request.headers.get('x-user-id');

    // Update transaction status to completed
    // This will trigger the stock restoration function
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('exchange_transaction')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating transaction status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to complete transaction' },
        { status: 500 }
      );
    }

    // Process refund if requested
    if (data.process_refund && transaction.transaction_type === 'return') {
      const refundAmount = data.refund_amount || transaction.trade_in_total_value;
      const refundMethod = data.refund_method || 'cash';

      const { error: refundError } = await supabase
        .from('exchange_refund')
        .insert({
          exchange_transaction_id: id,
          refund_amount: refundAmount,
          refund_method: refundMethod,
          refund_status: 'completed',
          processed_by: userId || null,
          processed_at: new Date().toISOString(),
          notes: data.refund_amount ? `Partial refund: ${refundAmount}` : null
        });

      if (refundError) {
        console.error('Error creating refund:', refundError);
        // Don't fail the transaction, just log the error
      }

      // Update transaction status to refunded if full refund
      if (refundAmount >= transaction.trade_in_total_value) {
        await supabase
          .from('exchange_transaction')
          .update({ status: 'refunded' })
          .eq('id', id);
      }
    }

    // Create sale record for new items purchased if requested
    if (data.create_sale && transaction.total_purchase_amount > 0) {
      const { data: purchaseItems } = await supabase
        .from('exchange_purchase_item')
        .select('*')
        .eq('exchange_transaction_id', id);

      if (purchaseItems && purchaseItems.length > 0) {
        // Generate receipt number
        const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create sale linked to exchange transaction
        const { data: sale, error: saleError } = await supabase
          .from('sale')
          .insert({
            store_id: transaction.store_id,
            cashier_id: transaction.cashier_id,
            customer_id: transaction.customer_id || null,
            receipt_number: receiptNumber,
            subtotal: transaction.total_purchase_amount,
            tax_amount: 0,
            total_amount: transaction.total_purchase_amount,
            payment_method: 'mixed',
            status: 'completed',
            transaction_date: new Date().toISOString(),
            notes: `Exchange transaction: ${transaction.transaction_number}. Trade-in value: ${transaction.trade_in_total_value}, Additional payment: ${transaction.additional_payment}`
          })
          .select()
          .single();

        if (!saleError && sale) {
          // Create sale items
          const saleItems = purchaseItems.map(item => ({
            sale_id: sale.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            discount_amount: item.discount_amount
          }));

          await supabase.from('sale_item').insert(saleItems);

          // Update product stock (already done by trigger, but ensure consistency)
          for (const item of purchaseItems) {
            await supabase.rpc('decrement_product_stock', {
              product_id_param: item.product_id,
              quantity_param: item.quantity
            });
          }
        }
      }
    }

    // Fetch complete transaction with relations
    const { data: completeTransaction } = await supabase
      .from('exchange_transaction')
      .select(`
        *,
        customer:customer_id(id, name, phone, email),
        cashier:cashier_id(id, name, username),
        original_sale:original_sale_id(id, receipt_number, transaction_date, total_amount),
        exchange_items:exchange_item(*, product:product_id(id, name, sku, barcode, price, stock_quantity)),
        purchase_items:exchange_purchase_item(*, product:product_id(id, name, sku, barcode, price, stock_quantity)),
        refunds:exchange_refund(*, processed_by_user:processed_by(id, name, username))
      `)
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      transaction: completeTransaction || updatedTransaction,
      message: 'Exchange transaction completed successfully. Stock has been restored.'
    });

  } catch (error) {
    console.error('Error in POST /api/exchanges/[id]/complete:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

