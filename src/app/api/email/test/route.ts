import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    // Test email service connection
    const connectionTest = await EmailService.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Email service connection failed',
        details: connectionTest.error
      }, { status: 500 });
    }

    // Test sending a sample welcome email
    const testEmailData = {
      businessName: 'Test Business',
      businessEmail: process.env.TEST_EMAIL || 'test@example.com',
      adminName: 'Test Administrator',
      adminUsername: 'admin.testbusiness',
      adminPassword: 'TestPassword123!',
      platformUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://scims.com',
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://scims.com'}/auth/login`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@scims.com'
    };

    const emailResult = await EmailService.sendWelcomeEmail(testEmailData);

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Email service test successful',
        messageId: emailResult.messageId,
        testEmail: testEmailData.businessEmail
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        details: emailResult.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Email service test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Use POST method to test email service'
  }, { status: 405 });
}
