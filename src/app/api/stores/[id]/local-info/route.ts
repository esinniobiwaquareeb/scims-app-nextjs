import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch store local info
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

    const { data: localInfo, error } = await supabase
      .from('store_local_info')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch store local info' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      localInfo: localInfo || null
    });

  } catch (error) {
    console.error('Store local info API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update store local info
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

    const localInfoData = {
      store_id: storeId,
      local_business_name: body.local_business_name || null,
      local_address: body.local_address || null,
      local_phone: body.local_phone || null,
      local_email: body.local_email || null,
      local_website: body.local_website || null,
      local_description: body.local_description || null,
      local_currency: body.local_currency || null,
      local_language: body.local_language || null,
      local_timezone: body.local_timezone || null,
      local_tax_rate: body.local_tax_rate || null,
      local_tax_number: body.local_tax_number || null,
      local_license_number: body.local_license_number || null,
      local_operating_hours: body.local_operating_hours || null,
      local_social_media: body.local_social_media || null,
      updated_at: new Date().toISOString()
    };

    // Check if local info exists
    const { error: checkError } = await supabase
      .from('store_local_info')
      .select('id')
      .eq('store_id', storeId)
      .single();

    let result;
    if (checkError && checkError.code === 'PGRST116') {
      // Local info doesn't exist, create new
      result = await supabase
        .from('store_local_info')
        .insert(localInfoData)
        .select()
        .single();
    } else if (checkError) {
      console.error('Error checking existing local info:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing local info' },
        { status: 500 }
      );
    } else {
      // Local info exists, update it
      result = await supabase
        .from('store_local_info')
        .update(localInfoData)
        .eq('store_id', storeId)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving store local info:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to save store local info' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      localInfo: result.data,
      message: 'Store local info updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/stores/[id]/local-info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
