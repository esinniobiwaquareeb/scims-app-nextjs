import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const { data: suppliers, error } = await supabase
      .from('supplier')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch suppliers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suppliers: suppliers || []
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact_person, email, phone, address, business_id } = body;

    if (!name || !business_id) {
      return NextResponse.json(
        { success: false, error: 'Name and business_id are required' },
        { status: 400 }
      );
    }

    const { data: supplier, error } = await supabase
      .from('supplier')
      .insert({
        name,
        contact_person,
        email,
        phone,
        address,
        business_id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create supplier' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      supplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
