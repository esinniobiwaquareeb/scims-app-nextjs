import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch platform health metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('platform_health')
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

    const { data: healthMetrics, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch platform health metrics' },
        { status: 500 }
      );
    }

    // Get count for pagination
    const { count } = await supabase
      .from('platform_health')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      healthMetrics: healthMetrics || [],
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Platform health API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new platform health entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.service_name || !body.status) {
      return NextResponse.json(
        { success: false, error: 'service_name and status are required' },
        { status: 400 }
      );
    }

    const healthData = {
      service_name: body.service_name,
      status: body.status,
      response_time_ms: body.response_time_ms || null,
      error_message: body.error_message || null,
      metadata: body.metadata || null
    };

    const { data: health, error } = await supabase
      .from('platform_health')
      .insert(healthData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create platform health entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      health,
      message: 'Platform health entry created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/platform/health:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}