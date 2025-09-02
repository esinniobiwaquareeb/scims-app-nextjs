import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// GET - Fetch all languages
export async function GET(request: NextRequest) {
  try {
    const { data: languages, error } = await supabase
      .from('language')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching languages:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch languages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      languages: languages || []
    });

  } catch (error) {
    console.error('Error in GET /api/languages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}