import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch all currencies
export async function GET(request: NextRequest) {
  try {
    const { data: currencies, error } = await supabase
      .from('currency')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching currencies:', error);
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
    console.error('Error in GET /api/currencies:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}