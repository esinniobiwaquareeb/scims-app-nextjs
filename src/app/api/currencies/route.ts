import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active currencies
    const { data: currencies, error } = await supabase
      .from('currency')
      .select('id, name, symbol, code')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch currencies' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      currencies: currencies || []
    });

  } catch (error) {
    console.error('Currencies API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
