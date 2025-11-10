import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import type { 
  CreateExchangeTransactionData, 
  ExchangeTransaction, 
  ExchangeTransactionFilters 
} from '@/types/exchange';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Generate unique transaction number
function generateTransactionNumber(type: string): string {
  const prefix = type === 'return' ? 'RET' : type === 'trade_in' ? 'TRD' : 'EXC';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// POST - Create new exchange transaction
export async function POST(request: NextRequest) {
  try {
    const data: CreateExchangeTransactionData = await request.json();

    // Validate required fields
    if (!data.store_id || !data.transaction_type || !data.exchange_items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: store_id, transaction_type, and exchange_items are required' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (!['return', 'trade_in', 'exchange'].includes(data.transaction_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction_type. Must be: return, trade_in, or exchange' },
        { status: 400 }
      );
    }

    // For returns, validate original_sale_id and quantities
    if (data.transaction_type === 'return') {
      if (!data.original_sale_id) {
        return NextResponse.json(
          { success: false, error: 'original_sale_id is required for return transactions' },
          { status: 400 }
        );
      }

      // Validate return quantities don't exceed purchased quantities
      const { data: originalSale } = await supabase
        .from('sale')
        .select(`
          id,
          items:sale_item(
            id,
            product_id,
            quantity
          )
        `)
        .eq('id', data.original_sale_id)
        .single();

      if (!originalSale) {
        return NextResponse.json(
          { success: false, error: 'Original sale not found' },
          { status: 404 }
        );
      }

      // Get already returned quantities for each sale item
      const { data: existingReturnTransactions } = await supabase
        .from('exchange_transaction')
        .select('id')
        .eq('original_sale_id', data.original_sale_id)
        .in('status', ['pending', 'completed']);

      const returnTransactionIds = (existingReturnTransactions || []).map((t: { id: string }) => t.id);

      // Calculate already returned quantities per sale item
      const alreadyReturnedByItem: { [key: string]: number } = {};
      if (returnTransactionIds.length > 0) {
        const { data: existingReturnItems } = await supabase
          .from('exchange_item')
          .select('original_sale_item_id, quantity')
          .eq('item_type', 'returned')
          .in('exchange_transaction_id', returnTransactionIds);

        (existingReturnItems || []).forEach((item: { original_sale_item_id: string; quantity: number }) => {
          if (item.original_sale_item_id) {
            alreadyReturnedByItem[item.original_sale_item_id] = 
              (alreadyReturnedByItem[item.original_sale_item_id] || 0) + (item.quantity || 0);
          }
        });
      }

      // Check if all items have been fully returned
      const allItemsFullyReturned = (originalSale.items || []).every((saleItem: { id: string; quantity: number }) => {
        const alreadyReturned = alreadyReturnedByItem[saleItem.id] || 0;
        return alreadyReturned >= saleItem.quantity;
      });

      if (allItemsFullyReturned && (originalSale.items || []).length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'All items from this receipt have already been returned. No further returns are allowed for this receipt.' 
          },
          { status: 400 }
        );
      }

      if (returnTransactionIds.length > 0) {
        // Validate each return item
        for (const returnItem of data.exchange_items) {
          if (returnItem.item_type === 'returned' && returnItem.original_sale_item_id) {
            const saleItem = (originalSale.items || []).find(
              (item: { id: string }) => item.id === returnItem.original_sale_item_id
            );

            if (!saleItem) {
              return NextResponse.json(
                { success: false, error: `Sale item not found for return item` },
                { status: 400 }
              );
            }

            const alreadyReturned = alreadyReturnedByItem[returnItem.original_sale_item_id] || 0;
            const remainingReturnable = saleItem.quantity - alreadyReturned;

            if (returnItem.quantity > remainingReturnable) {
              return NextResponse.json(
                { 
                  success: false, 
                  error: `Cannot return ${returnItem.quantity} items. Only ${remainingReturnable} items can be returned (${alreadyReturned} already returned out of ${saleItem.quantity} purchased).` 
                },
                { status: 400 }
              );
            }
          }
        }
      } else {
        // No previous returns, just check against original purchase
        for (const returnItem of data.exchange_items) {
          if (returnItem.item_type === 'returned' && returnItem.original_sale_item_id) {
            const saleItem = (originalSale.items || []).find(
              (item: { id: string }) => item.id === returnItem.original_sale_item_id
            );

            if (!saleItem) {
              return NextResponse.json(
                { success: false, error: `Sale item not found for return item` },
                { status: 400 }
              );
            }

            if (returnItem.quantity > saleItem.quantity) {
              return NextResponse.json(
                { 
                  success: false, 
                  error: `Cannot return ${returnItem.quantity} items. Only ${saleItem.quantity} items were purchased.` 
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // Generate transaction number
    const transactionNumber = generateTransactionNumber(data.transaction_type);

    // Calculate totals
    const tradeInTotalValue = data.exchange_items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_value),
      0
    );

    const totalPurchaseAmount = data.purchase_items?.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price) - (item.discount_amount || 0),
      0
    ) || 0;

    // Get cashier_id from request headers
    const cashierId = request.headers.get('x-user-id');
    if (!cashierId) {
      return NextResponse.json(
        { success: false, error: 'cashier_id is required' },
        { status: 400 }
      );
    }

    // Create exchange transaction
    const { data: exchangeTransaction, error: transactionError } = await supabase
      .from('exchange_transaction')
      .insert({
        store_id: data.store_id,
        customer_id: data.customer_id || null,
        cashier_id: cashierId,
        transaction_number: transactionNumber,
        transaction_type: data.transaction_type,
        original_sale_id: data.original_sale_id || null,
        trade_in_total_value: tradeInTotalValue,
        additional_payment: data.additional_payment || 0,
        total_purchase_amount: totalPurchaseAmount,
        status: 'pending',
        notes: data.notes || null
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating exchange transaction:', transactionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create exchange transaction' },
        { status: 500 }
      );
    }

    // Create exchange items
    const exchangeItems = data.exchange_items.map(item => ({
      exchange_transaction_id: exchangeTransaction.id,
      item_type: item.item_type,
      original_sale_item_id: item.original_sale_item_id || null,
      product_id: item.product_id || null,
      product_name: item.product_name || null,
      product_sku: item.product_sku || null,
      product_barcode: item.product_barcode || null,
      quantity: item.quantity,
      unit_value: item.unit_value,
      total_value: item.quantity * item.unit_value,
      condition: item.condition,
      condition_notes: item.condition_notes || null,
      add_to_inventory: item.add_to_inventory !== false, // Default to true
      inventory_condition: null
    }));

    const { error: itemsError } = await supabase
      .from('exchange_item')
      .insert(exchangeItems);

    if (itemsError) {
      console.error('Error creating exchange items:', itemsError);
      // Rollback transaction
      await supabase.from('exchange_transaction').delete().eq('id', exchangeTransaction.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create exchange items' },
        { status: 500 }
      );
    }

    // Create purchase items if provided
    if (data.purchase_items && data.purchase_items.length > 0) {
      const purchaseItems = data.purchase_items.map(item => ({
        exchange_transaction_id: exchangeTransaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        discount_amount: item.discount_amount || 0
      }));

      const { error: purchaseItemsError } = await supabase
        .from('exchange_purchase_item')
        .insert(purchaseItems);

      if (purchaseItemsError) {
        console.error('Error creating purchase items:', purchaseItemsError);
        // Rollback transaction
        await supabase.from('exchange_transaction').delete().eq('id', exchangeTransaction.id);
        return NextResponse.json(
          { success: false, error: 'Failed to create purchase items' },
          { status: 500 }
        );
      }
    }

    // Fetch complete transaction with relations
    const { data: completeTransaction, error: fetchError } = await supabase
      .from('exchange_transaction')
      .select(`
        *,
        customer:customer_id(id, name, phone, email),
        cashier:cashier_id(id, name, username),
        original_sale:original_sale_id(id, receipt_number, transaction_date, total_amount),
        exchange_items:exchange_item(*, product:product_id(id, name, sku, barcode, price, stock_quantity)),
        purchase_items:exchange_purchase_item(*, product:product_id(id, name, sku, barcode, price, stock_quantity))
      `)
      .eq('id', exchangeTransaction.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete transaction:', fetchError);
    }

    return NextResponse.json({
      success: true,
      transaction: completeTransaction || exchangeTransaction,
      message: 'Exchange transaction created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/exchanges:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List exchange transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: ExchangeTransactionFilters = {
      store_id: searchParams.get('store_id') || undefined,
      customer_id: searchParams.get('customer_id') || undefined,
      transaction_type: (searchParams.get('transaction_type') as ExchangeTransaction['transaction_type']) || undefined,
      status: (searchParams.get('status') as ExchangeTransaction['status']) || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    let query = supabase
      .from('exchange_transaction')
      .select(`
        *,
        customer:customer_id(id, name, phone, email),
        cashier:cashier_id(id, name, username),
        original_sale:original_sale_id(id, receipt_number, transaction_date, total_amount),
        exchange_items:exchange_item(*, product:product_id(id, name, sku, barcode, price, stock_quantity)),
        purchase_items:exchange_purchase_item(*, product:product_id(id, name, sku, barcode, price, stock_quantity))
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.store_id) {
      query = query.eq('store_id', filters.store_id);
    }
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.start_date) {
      query = query.gte('transaction_date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('transaction_date', filters.end_date);
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Error fetching exchange transactions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exchange transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      pagination: {
        limit,
        offset,
        total: transactions?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in GET /api/exchanges:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

