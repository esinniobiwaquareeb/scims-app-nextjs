import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/Email and password are required' },
        { status: 400 }
      );
    }

    // Determine if input is email or username
    const identifier = username.trim().toLowerCase();
    const isEmail = identifier.includes('@');

    // Find the user record by username or email
    let query = supabase
      .from('user')
      .select('*')
      .eq('is_active', true);

    if (isEmail) {
      query = query.eq('email', identifier);
    } else {
      query = query.eq('username', identifier);
    }

    const { data: user, error: userError } = await query.single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials or user account not found' },
        { status: 401 }
      );
    }

    // Check if demo mode is enabled for demo users
    if (user.is_demo) {
      const { data: platformSettings } = await supabase
        .from('platform_setting')
        .select('demo_mode')
        .single();

      const isDemoModeEnabled = platformSettings?.demo_mode === true;

      if (!isDemoModeEnabled) {
        return NextResponse.json(
          { success: false, error: 'Demo mode is currently disabled. Please contact support.' },
          { status: 403 }
        );
      }
    }

    // Check if email is verified (only for non-demo users)
    if (!user.is_demo && !user.email_verified) {
      return NextResponse.json(
        { success: false, error: 'Please verify your email address before logging in. Check your email for a verification link.' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get user business roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_business_role')
      .select(`
        business_id,
        store_id,
        business(id, name, subscription_plan_id, subscription_status),
        store(id, name, address)
      `)
      .eq('user_id', user.id);

    if (rolesError) {
      console.warn('Failed to load user roles:', rolesError);
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        business_id: userRoles?.[0]?.business_id || null,
        store_id: userRoles?.[0]?.store_id || null,
        activity_type: 'login',
        category: 'Authentication',
        description: `User logged in: ${user.username}${user.email ? ` (${user.email})` : ''}`,
        metadata: {
          username: user.username,
          role: user.role
        }
      });

    // Prepare user response
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: userRoles?.[0]?.business_id || null,
      storeId: userRoles?.[0]?.store_id || null,
      isActive: user.is_active,
      isDemo: user.is_demo,
      createdAt: user.created_at
    };

    return NextResponse.json({
      success: true,
      user: userResponse
    });

  } catch (error: unknown) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
