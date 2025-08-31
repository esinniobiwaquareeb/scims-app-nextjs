import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      business_id,
      store_id,
      activity_type,
      category,
      description,
      metadata,
      ip_address,
      user_agent
    } = body;

    // Validate required fields
    if (!user_id || !activity_type || !category || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert activity log
    const { data, error } = await supabase
      .from('activity_log')
      .insert({
        user_id,
        business_id,
        store_id,
        activity_type,
        category,
        description,
        metadata,
        ip_address,
        user_agent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to log activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activity_log: data
    });

  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
