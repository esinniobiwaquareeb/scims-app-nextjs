import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';

// POST - Reset user password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { newPassword } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('id, username, name, email')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    const { error: updateError } = await supabase
      .from('user')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Log the password reset activity
    try {
      await supabase
        .from('activity_log')
        .insert({
          user_id: userId,
          activity_type: 'password_reset',
          category: 'Security',
          description: `Password reset for user: ${user.username}`,
          metadata: {
            username: user.username,
            name: user.name,
            email: user.email,
            reset_by: 'admin'
          }
        });
    } catch (logError) {
      // Don't fail the password reset if logging fails
      console.warn('Failed to log password reset activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
