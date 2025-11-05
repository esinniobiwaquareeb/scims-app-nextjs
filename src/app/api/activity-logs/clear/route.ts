import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// DELETE - Clear all activity logs
export async function DELETE() {
  try {
    const { error } = await supabase
      .from('activity_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records except system ones
    
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'All activity logs cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing activity logs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear activity logs' 
      },
      { status: 500 }
    );
  }
}
