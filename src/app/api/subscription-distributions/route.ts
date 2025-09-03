import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch subscription distributions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const subscriptionPlanId = searchParams.get('subscription_plan_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('subscription_distribution')
      .select(`
        *,
        business(
          id,
          name,
          business_type
        ),
        subscription_plan(
          id,
          name,
          price,
          currency
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (subscriptionPlanId) {
      query = query.eq('subscription_plan_id', subscriptionPlanId);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: distributions, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscription distributions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      distributions: distributions || [],
      pagination: {
        limit,
        offset,
        total: distributions?.length || 0
      }
    });

  } catch (error) {
    console.error('Subscription distributions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new subscription distribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.business_id || !body.subscription_plan_id || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'business_id, subscription_plan_id, and amount are required' },
        { status: 400 }
      );
    }

    const distributionData = {
      business_id: body.business_id,
      subscription_plan_id: body.subscription_plan_id,
      amount: body.amount,
      currency: body.currency || 'USD',
      distribution_type: body.distribution_type || 'revenue_share',
      percentage: body.percentage || null,
      status: body.status || 'pending',
      payment_method: body.payment_method || null,
      transaction_id: body.transaction_id || null,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: distribution, error } = await supabase
      .from('subscription_distribution')
      .insert(distributionData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create subscription distribution' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      distribution,
      message: 'Subscription distribution created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/subscription-distributions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
