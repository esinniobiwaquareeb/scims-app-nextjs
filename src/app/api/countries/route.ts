import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const { data: countries, error } = await supabase
      .from('country')
      .select('id, name, code, phone_code')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      countries: countries || []
    });

  } catch (error) {
    console.error('Countries API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
