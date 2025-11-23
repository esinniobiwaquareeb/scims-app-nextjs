import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch sales with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const store_id = searchParams.get('store_id');
    const business_id = searchParams.get('business_id');
    const cashier_id = searchParams.get('cashier_id');
    const customer_id = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const include_supply_orders = searchParams.get('include_supply_orders') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('sale')
      .select(`
        *,
        sale_item(
          *,
          product(
            id,
            name,
            sku,
            barcode,
            description,
            price,
            image_url
          )
        ),
        customer:customer_id(
          id,
          name,
          phone,
          email
        ),
        cashier:user(
          id,
          name,
          username
        ),
        store:store_id(
          id,
          name
        ),
        applied_coupon:applied_coupon_id(
          id,
          code,
          name,
          discount_value,
          discount_type:discount_type_id(
            name
          )
        ),
        applied_promotion:applied_promotion_id(
          id,
          name,
          discount_value,
          discount_type:discount_type_id(
            name
          )
        )
      `)
      .order('transaction_date', { ascending: false });

    // Apply filters
    if (store_id) query = query.eq('store_id', store_id);
    if (business_id) {
      // If business_id is provided, we need to filter by stores in that business
      const { data: stores, error: storesError } = await supabase
        .from('store')
        .select('id')
        .eq('business_id', business_id)
        .eq('is_active', true);
      
      if (storesError) throw storesError;
      
      if (stores && stores.length > 0) {
        const storeIds = stores.map(store => store.id);
        query = query.in('store_id', storeIds);
      } else {
        // No stores found for this business, return empty result
        return NextResponse.json({
          success: true,
          sales: [],
          pagination: { limit, offset, total: 0 }
        });
      }
    }
    if (cashier_id) query = query.eq('cashier_id', cashier_id);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (status) query = query.eq('status', status);
    if (start_date) query = query.gte('transaction_date', start_date);
    if (end_date) query = query.lte('transaction_date', end_date);
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: sales, error } = await query;
    
    if (error) throw error;

    // Transform the data to match the expected structure
    const transformedSales = (sales || []).map(sale => ({
      ...sale,
      sale_items: sale.sale_item?.map((item: {
        id: string;
        product: {
          id: string;
          name: string;
          price: number;
          sku?: string;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      }) => ({
        ...item,
        products: item.product, // Map product to products to match component expectations
        product: item.product // Keep original for backward compatibility
      })) || []
    }));

    // Fetch supply orders if requested
    let supplyOrders: unknown[] = [];
    if (include_supply_orders) {
      let supplyQuery = supabase
        .from('supply_order')
        .select(`
          *,
          customer:customer_id(
            id,
            name,
            phone,
            email
          ),
          cashier:user(
            id,
            name,
            username
          ),
          store:store_id(
            id,
            name
          ),
          items:supply_order_item(
            *,
            product:product_id(
              id,
              name,
              sku,
              barcode,
              price
            )
          )
        `)
        .order('supply_date', { ascending: false });

      if (store_id) supplyQuery = supplyQuery.eq('store_id', store_id);
      if (business_id) {
        const { data: stores } = await supabase
          .from('store')
          .select('id')
          .eq('business_id', business_id)
          .eq('is_active', true);
        if (stores && stores.length > 0) {
          const storeIds = stores.map(store => store.id);
          supplyQuery = supplyQuery.in('store_id', storeIds);
        }
      }
      if (cashier_id) supplyQuery = supplyQuery.eq('cashier_id', cashier_id);
      if (customer_id) supplyQuery = supplyQuery.eq('customer_id', customer_id);
      if (start_date) supplyQuery = supplyQuery.gte('supply_date', start_date);
      if (end_date) supplyQuery = supplyQuery.lte('supply_date', end_date);

      const { data: supplyData, error: supplyError } = await supplyQuery;
      if (!supplyError && supplyData) {
        // Transform supply orders to match sale structure for display
        supplyOrders = supplyData.map((order: {
          id: string;
          supply_number: string;
          total_amount: number;
          supply_date: string;
          status: string;
          customer?: { id: string; name: string; phone?: string; email?: string };
          cashier?: { id: string; name: string; username: string };
          store?: { id: string; name: string };
          items?: unknown[];
          [key: string]: unknown;
        }) => ({
          id: order.id,
          receipt_number: order.supply_number,
          transaction_type: 'supply',
          total_amount: order.total_amount,
          transaction_date: order.supply_date,
          supply_date: order.supply_date,
          status: order.status,
          payment_method: 'supply',
          customer: order.customer,
          cashier: order.cashier,
          store: order.store,
          sale_items: (order.items as Array<{
            product?: { id: string; name: string; sku?: string; price: number };
            quantity_supplied: number;
            unit_price: number;
            total_price: number;
            [key: string]: unknown;
          }>)?.map((item) => ({
            ...item,
            quantity: item.quantity_supplied,
            products: item.product,
            product: item.product
          })) || [],
          is_supply_order: true
        }));
      }
    }

    // Combine sales and supply orders, sort by date
    const allTransactions = [...transformedSales, ...supplyOrders].sort((a: { transaction_date: string }, b: { transaction_date: string }) => {
      return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
    });

    return NextResponse.json({
      success: true,
      sales: include_supply_orders ? allTransactions : transformedSales,
      pagination: {
        limit,
        offset,
        total: include_supply_orders ? allTransactions.length : transformedSales.length
      }
    });

  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch sales' 
      },
      { status: 500 }
    );
  }
}

// POST - Process a new sale
export async function POST(request: NextRequest) {
  try {
    const saleData = await request.json();

    // Generate a unique receipt number if not provided
    const receiptNumber = saleData.saleNumber || `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create transaction date in local timezone (not UTC)
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    
    const { data: sale, error } = await supabase
      .from('sale')
      .insert({
        store_id: saleData.store_id,
        cashier_id: saleData.cashier_id,
        customer_id: saleData.customer_id,
        receipt_number: receiptNumber,
        subtotal: saleData.subtotal,
        tax_amount: saleData.tax_amount,
        discount_amount: saleData.discount_amount || 0,
        total_amount: saleData.total_amount,
        payment_method: saleData.payment_method || 'mixed',
        cash_received: saleData.cash_received || null,
        change_given: saleData.change_given || null,
        status: 'completed',
        notes: saleData.notes,
        transaction_date: localDate.toISOString(),
        applied_coupon_id: saleData.applied_coupon_id || null,
        applied_promotion_id: saleData.applied_promotion_id || null,
        discount_reason: saleData.discount_reason || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting sale:', error);
      throw error;
    }

    // Insert sale items
    if (saleData.items?.length) {
      const saleItems = saleData.items.map((item: {
        product_id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        discount_amount?: number;
        [key: string]: unknown;
      }) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        discount_amount: item.discount_amount || 0
      }));

      const { error: itemsError } = await supabase
        .from('sale_item')
        .insert(saleItems);

      if (itemsError) {
        console.error('Error inserting sale items:', itemsError);
        throw itemsError;
      }

      // Update product stock for each item
      for (const item of saleData.items) {
        try {
          // Get current stock
          const { data: product, error: productError } = await supabase
            .from('product')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (productError) throw productError;

          const newStock = (product.stock_quantity || 0) - item.quantity;
          
          // Update stock
          const { error: stockUpdateError } = await supabase
            .from('product')
            .update({ stock_quantity: newStock })
            .eq('id', item.product_id);

          if (stockUpdateError) throw stockUpdateError;
        } catch (stockError) {
          console.error('Error updating stock for product:', item.product_id, stockError);
          // Continue with other products even if one fails
        }
      }
    }

    // Handle multiple payment methods if provided
    if (saleData.paymentMethods && Array.isArray(saleData.paymentMethods)) {
      for (const payment of saleData.paymentMethods) {
        try {
          await supabase
            .from('payment_method')
            .insert({
              sale_id: sale.id,
              method: payment.method,
              amount: payment.amount
            });
        } catch (paymentError) {
          console.error('Error adding payment method:', paymentError);
          // Continue with other payment methods even if one fails
        }
      }
    }

    // Handle coupon usage tracking
    if (saleData.applied_coupon_id) {
      try {
        // Create coupon usage record
        await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: saleData.applied_coupon_id,
            customer_id: saleData.customer_id || null,
            sale_id: sale.id,
            discount_amount: saleData.discount_amount || 0
          });

        // Update coupon usage count
        await supabase.rpc('update_coupon_usage_count', {
          coupon_id_param: saleData.applied_coupon_id
        });
      } catch (couponError) {
        console.error('Error tracking coupon usage:', couponError);
        // Don't fail the sale if coupon tracking fails
      }
    }

    // Handle promotion usage tracking
    if (saleData.applied_promotion_id) {
      try {
        // Create promotion usage record
        await supabase
          .from('promotion_usage')
          .insert({
            promotion_id: saleData.applied_promotion_id,
            customer_id: saleData.customer_id || null,
            sale_id: sale.id,
            discount_amount: saleData.discount_amount || 0
          });

        // Update promotion usage count
        await supabase.rpc('update_promotion_usage_count', {
          promotion_id_param: saleData.applied_promotion_id
        });
      } catch (promotionError) {
        console.error('Error tracking promotion usage:', promotionError);
        // Don't fail the sale if promotion tracking fails
      }
    }

    // Return the format expected by POS component
    return NextResponse.json({
      success: true,
      sale: sale
    });

  } catch (error) {
    console.error('Error processing sale:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process sale' 
      },
      { status: 500 }
    );
  }
}
