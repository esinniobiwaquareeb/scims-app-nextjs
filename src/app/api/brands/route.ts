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

    const { data: brands, error } = await supabase
      .from('brand')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch brands' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brands: brands || []
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, logo_url, website, contact_person, contact_email, contact_phone, business_id } = body;

    if (!name || !business_id) {
      return NextResponse.json(
        { success: false, error: 'Name and business_id are required' },
        { status: 400 }
      );
    }

    const { data: brand, error } = await supabase
      .from('brand')
      .insert({
        name,
        description,
        logo_url,
        website,
        contact_person,
        contact_email,
        contact_phone,
        business_id,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create brand' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
