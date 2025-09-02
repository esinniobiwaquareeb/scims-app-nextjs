import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find the user record
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials or user account not found' },
        { status: 401 }
      );
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
        description: `User logged in: ${user.username}`,
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
