import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Test if supply tables exist
export async function GET(request: NextRequest) {
  try {
    // Test if supply_order table exists by trying to select from it
    const { data: supplyOrders, error: supplyOrderError } = await supabase
      .from('supply_order')
      .select('id')
      .limit(1);

    if (supplyOrderError) {
      return NextResponse.json({
        success: false,
        error: 'supply_order table does not exist or is not accessible',
        details: supplyOrderError
      });
    }

    // Test if supply_order_item table exists
    const { data: supplyOrderItems, error: supplyOrderItemError } = await supabase
      .from('supply_order_item')
      .select('id')
      .limit(1);

    if (supplyOrderItemError) {
      return NextResponse.json({
        success: false,
        error: 'supply_order_item table does not exist or is not accessible',
        details: supplyOrderItemError
      });
    }

    // Test if supply_return table exists
    const { data: supplyReturns, error: supplyReturnError } = await supabase
      .from('supply_return')
      .select('id')
      .limit(1);

    if (supplyReturnError) {
      return NextResponse.json({
        success: false,
        error: 'supply_return table does not exist or is not accessible',
        details: supplyReturnError
      });
    }

    // Test if supply_payment table exists
    const { data: supplyPayments, error: supplyPaymentError } = await supabase
      .from('supply_payment')
      .select('id')
      .limit(1);

    if (supplyPaymentError) {
      return NextResponse.json({
        success: false,
        error: 'supply_payment table does not exist or is not accessible',
        details: supplyPaymentError
      });
    }

    return NextResponse.json({
      success: true,
      message: 'All supply management tables exist and are accessible',
      tables: {
        supply_order: 'exists',
        supply_order_item: 'exists',
        supply_return: 'exists',
        supply_payment: 'exists'
      }
    });

  } catch (error) {
    console.error('Error testing supply tables:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
