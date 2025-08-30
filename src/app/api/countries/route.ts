import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active countries from the database
    const { data: countries, error } = await supabase
      .from('country')
      .select('id, code, name, phone_code, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching countries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      countries: countries || [],
      success: true
    });

  } catch (error) {
    console.error('Unexpected error in countries API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
