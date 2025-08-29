import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET() {
  try {
    // Test basic database connection
    const { data: testData, error: testError } = await supabase
      .from('business')
      .select('id, name')
      .limit(1);

    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: testError.message
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'API is working',
      database: 'connected',
      testData: testData?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
