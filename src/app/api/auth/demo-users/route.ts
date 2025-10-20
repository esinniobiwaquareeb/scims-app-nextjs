import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function GET() {
  try {
    // Check if demo mode is enabled
    const { data: platformSettings } = await supabase
      .from('platform_setting')
      .select('demo_mode')
      .single();

    const isDemoModeEnabled = platformSettings?.demo_mode === true;

    // If demo mode is disabled, return empty array
    if (!isDemoModeEnabled) {
      return NextResponse.json({
        success: true,
        users: []
      });
    }

    const { data: users, error } = await supabase
      .from('user')
      .select('*')
      .eq('is_demo', true)
      .eq('is_active', true)
      .order('username');

    if (error) {
      throw error;
    }

    const demoUsers = users.map(user => ({
      username: user.username,
      role: user.role,
      description: user.name || `${user.role} account for testing`,
      isDemo: true
    }));

    return NextResponse.json({
      success: true,
      users: demoUsers
    });

  } catch (error: unknown) {
    console.error('Failed to get demo users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch demo users', users: [] },
      { status: 500 }
    );
  }
}
