import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { SupplyPaymentFormData } from '@/types/supply';

// GET - Fetch supply payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const storeId = searchParams.get('store_id');
    const supplyOrderId = searchParams.get('supply_order_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Store ID is only required when not filtering by specific supply order
    if (!supplyOrderId && !storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID or Supply Order ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('supply_payment')
      .select(`
        *,
        supply_order:supply_order_id(
          supply_number,
          store_id,
          customer:customer_id(name, phone),
          store:store_id(name)
        ),
        processed_by_user:processed_by(name)
      `)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (supplyOrderId) {
      query = query.eq('supply_order_id', supplyOrderId);
    } else {
      // First get supply order IDs for this store, then filter payments
      const { data: supplyOrderIds, error: orderError } = await supabase
        .from('supply_order')
        .select('id')
        .eq('store_id', storeId);

      if (orderError) {
        console.error('Error fetching supply order IDs:', orderError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch supply order IDs' },
          { status: 500 }
        );
      }

      if (supplyOrderIds && supplyOrderIds.length > 0) {
        const ids = supplyOrderIds.map(order => order.id);
        query = query.in('supply_order_id', ids);
      } else {
        // No supply orders for this store, return empty result
        return NextResponse.json({
          success: true,
          supply_payments: []
        });
      }
    }

    const { data: supplyPayments, error } = await query;

    if (error) {
      console.error('Error fetching supply payments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch supply payments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      supply_payments: supplyPayments || []
    });

  } catch (error) {
    console.error('Error in GET /api/supply-payments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new supply payment
export async function POST(request: NextRequest) {
  try {
    const paymentData: SupplyPaymentFormData = await request.json();

    // Validate required fields
    if (!paymentData.supply_order_id || !paymentData.amount_paid || !paymentData.payment_method) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if supply order exists and is in valid state
    const { data: supplyOrder, error: orderError } = await supabase
      .from('supply_order')
      .select(`
        id, 
        status, 
        total_amount,
        customer:customer_id(name, phone),
        store:store_id(name)
      `)
      .eq('id', paymentData.supply_order_id)
      .single();

    if (orderError || !supplyOrder) {
      return NextResponse.json(
        { success: false, error: 'Supply order not found' },
        { status: 404 }
      );
    }

    if (supplyOrder.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Cannot process payment for cancelled supply order' },
        { status: 400 }
      );
    }

    // Check if payment amount is valid
    if (paymentData.amount_paid <= 0) {
      return NextResponse.json(
        { success: false, error: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate remaining amount to be paid
    const { data: existingPayments, error: paymentsError } = await supabase
      .from('supply_payment')
      .select('amount_paid')
      .eq('supply_order_id', paymentData.supply_order_id);

    if (paymentsError) {
      console.error('Error fetching existing payments:', paymentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch existing payments' },
        { status: 500 }
      );
    }

    const totalPaid = existingPayments?.reduce((sum, payment) => sum + payment.amount_paid, 0) || 0;
    const remainingAmount = supplyOrder.total_amount - totalPaid;

    if (paymentData.amount_paid > remainingAmount) {
      return NextResponse.json(
        { success: false, error: `Payment amount (${paymentData.amount_paid}) exceeds remaining amount (${remainingAmount})` },
        { status: 400 }
      );
    }

    // Generate payment number using JavaScript (database function has ambiguous column reference)
    const currentYear = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const finalPaymentNumber = `PAY-${timestamp}-${currentYear}`;

    // Create supply payment
    const { data: supplyPayment, error: paymentError } = await supabase
      .from('supply_payment')
      .insert({
        supply_order_id: paymentData.supply_order_id,
        payment_number: finalPaymentNumber,
        payment_method: paymentData.payment_method,
        amount_paid: paymentData.amount_paid,
        payment_date: new Date().toISOString(),
        notes: paymentData.notes
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating supply payment:', paymentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create supply payment' },
        { status: 500 }
      );
    }

    // Check if supply order is now fully paid
    const newTotalPaid = totalPaid + paymentData.amount_paid;
    if (newTotalPaid >= supplyOrder.total_amount) {
      // Update supply order status to completed
      await supabase
        .from('supply_order')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentData.supply_order_id);
    }

    // Fetch the complete supply payment with related data
    const { data: completeSupplyPayment, error: fetchError } = await supabase
      .from('supply_payment')
      .select(`
        *,
        supply_order:supply_order_id(
          supply_number,
          customer:customer_id(name, phone),
          store:store_id(name)
        ),
        processed_by_user:processed_by(name)
      `)
      .eq('id', supplyPayment.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete supply payment:', fetchError);
    }

    return NextResponse.json({
      success: true,
      supply_payment: completeSupplyPayment || supplyPayment
    });

  } catch (error) {
    console.error('Error in POST /api/supply-payments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
