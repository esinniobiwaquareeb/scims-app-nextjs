import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch platform analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('platform_analytic')
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

    const { data: analytics, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch platform analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics: analytics || [],
      pagination: {
        limit,
        offset,
        total: analytics?.length || 0
      }
    });

  } catch (error) {
    console.error('Platform analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new platform analytics entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.metric_name || !body.metric_value) {
      return NextResponse.json(
        { success: false, error: 'metric_name and metric_value are required' },
        { status: 400 }
      );
    }

    const analyticsData = {
      metric_name: body.metric_name,
      metric_value: body.metric_value,
      metric_type: body.metric_type || 'counter',
      business_id: body.business_id || null,
      store_id: body.store_id || null,
      user_id: body.user_id || null,
      metadata: body.metadata || null,
      created_at: new Date().toISOString()
    };

    const { data: analytics, error } = await supabase
      .from('platform_analytic')
      .insert(analyticsData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create platform analytics entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics,
      message: 'Platform analytics entry created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/platform/analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
