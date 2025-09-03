import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch platform revenue data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('platform_revenue')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: revenueData, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch platform revenue data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      revenueData: revenueData || [],
      pagination: {
        limit,
        offset,
        total: revenueData?.length || 0
      }
    });

  } catch (error) {
    console.error('Platform revenue API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new platform revenue entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.revenue_type || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'revenue_type and amount are required' },
        { status: 400 }
      );
    }

    const revenueData = {
      revenue_type: body.revenue_type,
      amount: body.amount,
      currency: body.currency || 'USD',
      business_id: body.business_id || null,
      subscription_plan_id: body.subscription_plan_id || null,
      payment_method: body.payment_method || null,
      transaction_id: body.transaction_id || null,
      metadata: body.metadata || null,
      created_at: new Date().toISOString()
    };

    const { data: revenue, error } = await supabase
      .from('platform_revenue')
      .insert(revenueData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create platform revenue entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      revenue,
      message: 'Platform revenue entry created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/platform/revenue:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
