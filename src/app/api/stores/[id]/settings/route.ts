import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Fetch store settings
    const { data: settings, error } = await supabase
      .from('store_setting')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch store settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: settings || {}
    });

  } catch (error) {
    console.error('Store settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    const body = await request.json();
    
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Update store settings
    const { data: settings, error } = await supabase
      .from('store_setting')
      .upsert({
        store_id: storeId,
        ...body,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update store settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Store settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
