import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { data: discountTypes, error } = await supabase
      .from('discount_type')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching discount types:', error);
      return NextResponse.json(
        { error: 'Failed to fetch discount types' },
        { status: 500 }
      );
    }

    return NextResponse.json({ discountTypes });
  } catch (error) {
    console.error('Error in GET /api/discounts/types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
