import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Fetch all stores for the business
    const { data: stores, error } = await supabase
      .from('store')
      .select(`
        id,
        name,
        address,
        city,
        state,
        postal_code,
        phone,
        email,
        manager_name,
        is_active,
        created_at,
        updated_at,
        currency_id,
        language_id,
        country_id
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching business stores:', error);
      return NextResponse.json(
        { error: 'Failed to fetch business stores' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stores: stores || [] });
  } catch (error) {
    console.error('Error in business stores API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
