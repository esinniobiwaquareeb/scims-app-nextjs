import { createTransport } from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

const transporter = createTransport(emailConfig);

export interface WelcomeEmailData {
  businessName: string;
  businessEmail: string;
  adminName: string;
  adminUsername: string;
  adminPassword: string;
  platformUrl: string;
  loginUrl: string;
  supportEmail: string;
}

export interface VerificationEmailData {
  to: string;
  name: string;
  verificationUrl: string;
  businessName: string;
}

export interface PasswordResetEmailData {
  to: string;
  name: string;
  resetUrl: string;
  businessName?: string;
}

export interface AffiliateApplicationEmailData {
  to: string;
  name: string;
  affiliateCode: string;
  platformUrl: string;
}

export interface AffiliateApprovalEmailData {
  to: string;
  name: string;
  affiliateCode: string;
  loginUrl: string;
  password?: string;
  signupCommissionType?: string;
  signupCommissionRate?: number;
  signupCommissionFixed?: number;
  subscriptionCommissionRate?: number;
  platformUrl: string;
}

export interface AffiliateRejectionEmailData {
  to: string;
  name: string;
  rejectionReason?: string;
  platformUrl: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
    try {
      const {
        businessName,
        businessEmail,
        adminName,
        adminUsername,
        adminPassword,
        platformUrl,
        loginUrl,
        supportEmail
      } = data;

      const subject = `Welcome to SCIMS - Your Business Account is Ready!`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SCIMS</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #A969A7 0%, #8B5A8B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: #fff; border: 2px solid #A969A7; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credential-item { margin: 10px 0; }
            .label { font-weight: bold; color: #A969A7; }
            .value { font-family: monospace; background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
            .button { display: inline-block; background: #A969A7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .important { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to SCIMS!</h1>
              <p>Your business account has been successfully created</p>
            </div>
            
            <div class="content">
              <h2>Hello ${adminName},</h2>
              
              <p>Welcome to <strong>SCIMS (Store and Customer Information Management System)</strong>! We're excited to have you on board.</p>
              
              <p>Your business <strong>"${businessName}"</strong> has been successfully registered and is ready to use.</p>
              
              <div class="important">
                <h3>🔐 Your Login Credentials</h3>
                <p><strong>Please save these credentials securely:</strong></p>
              </div>
              
              <div class="credentials">
                <div class="credential-item">
                  <span class="label">Username:</span>
                  <span class="value">${adminUsername}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Password:</span>
                  <span class="value">${adminPassword}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Login URL:</span>
                  <span class="value">${loginUrl}</span>
                </div>
              </div>
              
              <div class="important">
                <h3>⚠️ Important Security Note</h3>
                <p>For security reasons, we recommend changing your password after your first login.</p>
              </div>
              
              <h3>🚀 Getting Started</h3>
              <ol>
                <li><strong>Login</strong> to your account using the credentials above</li>
                <li><strong>Complete your business profile</strong> with store information</li>
                <li><strong>Add your first store</strong> to start managing inventory</li>
                <li><strong>Invite team members</strong> to collaborate</li>
                <li><strong>Configure settings</strong> according to your business needs</li>
              </ol>
              
              <h3>🔗 Quick Links</h3>
              <p>
                <a href="${loginUrl}" class="button">Login to Your Account</a>
              </p>
              
              <h3>📚 Resources</h3>
              <ul>
                <li><strong>Documentation:</strong> <a href="${platformUrl}/docs">${platformUrl}/docs</a></li>
                <li><strong>Video Tutorials:</strong> <a href="${platformUrl}/tutorials">${platformUrl}/tutorials</a></li>
                <li><strong>Support Center:</strong> <a href="${platformUrl}/support">${platformUrl}/support</a></li>
              </ul>
              
              <h3>📞 Need Help?</h3>
              <p>Our support team is here to help you get started:</p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:${supportEmail}">${supportEmail}</a></li>
                <li><strong>Live Chat:</strong> Available on our platform</li>
                <li><strong>Phone:</strong> Check our support page for current hours</li>
              </ul>
              
              <div class="footer">
                <p>Thank you for choosing SCIMS!</p>
                <p>© ${new Date().getFullYear()} SCIMS Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Welcome to SCIMS - Your Business Account is Ready!

Hello ${adminName},

Welcome to SCIMS (Store and Customer Information Management System)! We're excited to have you on board.

Your business "${businessName}" has been successfully registered and is ready to use.

🔐 Your Login Credentials:
Username: ${adminUsername}
Password: ${adminPassword}
Login URL: ${loginUrl}

⚠️ Important Security Note:
For security reasons, we recommend changing your password after your first login.

🚀 Getting Started:
1. Login to your account using the credentials above
2. Complete your business profile with store information
3. Add your first store to start managing inventory
4. Invite team members to collaborate
5. Configure settings according to your business needs

🔗 Quick Links:
Login to Your Account: ${loginUrl}

📚 Resources:
Documentation: ${platformUrl}/docs
Video Tutorials: ${platformUrl}/tutorials
Support Center: ${platformUrl}/support

📞 Need Help?
Our support team is here to help you get started:
Email: ${supportEmail}
Live Chat: Available on our platform
Phone: Check our support page for current hours

Thank you for choosing SCIMS!

© ${new Date().getFullYear()} SCIMS Platform. All rights reserved.
      `;

      const mailOptions = {
        from: `"SCIMS Platform" <${process.env.SMTP_USER}>`,
        to: businessEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
    try {
      const { to, name, verificationUrl } = data;

      const subject = `Verify Your Email - Welcome to SCIMS!`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - SCIMS</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #A969A7 0%, #8B5A8B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #A969A7; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .important { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .verification-link { background: #fff; border: 2px solid #A969A7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to SCIMS!</h1>
              <p>Please verify your email address to complete your registration</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>Thank you for registering with <strong>SCIMS (Stock Control & Inventory Management System)</strong>!</p>
              
              <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
              
              <div class="verification-link">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${verificationUrl}
              </p>
              
              <div class="important">
                <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification email.
              </div>
              
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Access your SCIMS dashboard</li>
                <li>Manage your business operations</li>
                <li>Set up your inventory and products</li>
                <li>Start processing sales and orders</li>
              </ul>
              
              <p>If you didn't create an account with SCIMS, please ignore this email.</p>
              
              <p>Welcome aboard!</p>
              <p><strong>The SCIMS Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>© ${new Date().getFullYear()} SCIMS. All rights reserved.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"SCIMS" <${emailConfig.auth.user}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Verification email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async testConnection(): Promise<EmailResult> {
    try {
      await transporter.verify();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  static async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult> {
    try {
      const { to, name, resetUrl, businessName = 'SCIMS' } = data;

      const subject = `Password Reset Request - ${businessName}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #A969A7 0%, #8B5A8B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #A969A7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .important { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .security { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
              <p>Reset your ${businessName} account password</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>We received a request to reset your password for your <strong>${businessName}</strong> account.</p>
              
              <p>If you requested this password reset, click the button below to set a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <div class="important">
                <strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons.
              </div>
              
              <div class="security">
                <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                ${resetUrl}
              </p>
            </div>
            
            <div class="footer">
              <p>This email was sent from ${businessName} - Stock Control Inventory Management System</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"${businessName}" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Password reset email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async sendAffiliateApplicationEmail(data: AffiliateApplicationEmailData): Promise<EmailResult> {
    try {
      const { to, name, affiliateCode, platformUrl } = data;

      const subject = `Affiliate Application Received - SCIMS`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Affiliate Application Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #A969A7 0%, #8B5A8B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: #fff; border: 2px solid #A969A7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .code { font-family: monospace; font-size: 24px; font-weight: bold; color: #A969A7; letter-spacing: 2px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .info { background: #e3f2fd; border: 1px solid #90caf9; border-radius: 6px; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Application Received!</h1>
              <p>Thank you for applying to become a SCIMS Affiliate Partner</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>Thank you for your interest in becoming an affiliate partner with <strong>SCIMS</strong>!</p>
              
              <p>We have successfully received your affiliate application and it is currently under review.</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your Affiliate Code:</p>
                <div class="code">${affiliateCode}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Save this code for future reference</p>
              </div>
              
              <div class="info">
                <h3 style="margin-top: 0;">📋 What's Next?</h3>
                <ul style="margin-bottom: 0;">
                  <li>Our team will review your application</li>
                  <li>We'll get back to you via email within 2-3 business days</li>
                  <li>Once approved, you'll receive login credentials to access your affiliate dashboard</li>
                </ul>
              </div>
              
              <h3>🎯 What You Can Do While You Wait</h3>
              <ul>
                <li>Learn more about SCIMS at <a href="${platformUrl}">${platformUrl}</a></li>
                <li>Share your unique affiliate code: <strong>${affiliateCode}</strong></li>
                <li>Prepare your marketing materials</li>
              </ul>
              
              <p>If you have any questions about your application, please don't hesitate to contact our support team.</p>
              
              <p>We look forward to working with you!</p>
              <p><strong>The SCIMS Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>© ${new Date().getFullYear()} SCIMS. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"SCIMS Affiliate Program" <${emailConfig.auth.user}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Affiliate application email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async sendAffiliateApprovalEmail(data: AffiliateApprovalEmailData): Promise<EmailResult> {
    try {
      const { 
        to, 
        name, 
        affiliateCode, 
        loginUrl, 
        password,
        signupCommissionType,
        signupCommissionRate,
        signupCommissionFixed,
        subscriptionCommissionRate,
        platformUrl
      } = data;

      const subject = `🎉 Congratulations! Your Affiliate Application Has Been Approved - SCIMS`;
      
      const signupCommissionText = signupCommissionType === 'fixed' 
        ? `$${signupCommissionFixed?.toFixed(2)} per signup`
        : `${signupCommissionRate?.toFixed(1)}% per signup`;
      
      const subscriptionCommissionText = `${subscriptionCommissionRate?.toFixed(1)}% of subscription payments`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Affiliate Application Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: #fff; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credential-item { margin: 10px 0; }
            .label { font-weight: bold; color: #059669; }
            .value { font-family: monospace; background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .info { background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .commission-box { background: #fff; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your Affiliate Application Has Been Approved</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>Great news! Your application to become a SCIMS Affiliate Partner has been <strong>approved</strong>!</p>
              
              <div class="info">
                <h3 style="margin-top: 0;">✨ You're now officially part of the SCIMS Affiliate Program!</h3>
                <p style="margin-bottom: 0;">Start sharing your unique affiliate code and earn commissions when businesses sign up and subscribe to SCIMS.</p>
              </div>
              
              ${password ? `
              <div class="credentials">
                <h3 style="margin-top: 0; color: #059669;">🔐 Your Login Credentials</h3>
                <div class="credential-item">
                  <span class="label">Affiliate Code:</span>
                  <span class="value">${affiliateCode}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Email:</span>
                  <span class="value">${to}</span>
                </div>
                <div class="credential-item">
                  <span class="label">Password:</span>
                  <span class="value">${password}</span>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #666; margin: 0;">
                    <strong>⚠️ Important:</strong> Please save these credentials securely. We recommend changing your password after your first login.
                  </p>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Login to Affiliate Dashboard</a>
              </div>
              ` : `
              <div class="credentials">
                <h3 style="margin-top: 0; color: #059669;">Your Affiliate Code</h3>
                <div class="credential-item" style="text-align: center;">
                  <div style="font-family: monospace; font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: 2px;">
                    ${affiliateCode}
                  </div>
                </div>
                <p style="text-align: center; color: #666; margin-top: 10px;">
                  Use this code to track referrals. Login credentials will be sent separately if a password was set.
                </p>
              </div>
              `}
              
              <div class="commission-box">
                <h3 style="margin-top: 0; color: #059669;">💰 Your Commission Structure</h3>
                <div style="margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Signup Commission:</strong> ${signupCommissionText}</p>
                  <p style="margin: 5px 0;"><strong>Subscription Commission:</strong> ${subscriptionCommissionText}</p>
                </div>
                <p style="font-size: 14px; color: #666; margin-bottom: 0;">
                  You'll earn commissions when businesses sign up using your affiliate code and when they subscribe to SCIMS plans.
                </p>
              </div>
              
              <h3>🚀 Getting Started</h3>
              <ol>
                <li><strong>Access your dashboard</strong> at <a href="${loginUrl}">${loginUrl}</a></li>
                <li><strong>Get your affiliate link</strong> from the dashboard</li>
                <li><strong>Start sharing</strong> your affiliate code or link with businesses</li>
                <li><strong>Track your referrals</strong> and commissions in real-time</li>
                <li><strong>Request payouts</strong> when you're ready to cash out</li>
              </ol>
              
              <h3>📚 Resources</h3>
              <ul>
                <li><strong>Affiliate Dashboard:</strong> <a href="${loginUrl}">${loginUrl}</a></li>
                <li><strong>Platform:</strong> <a href="${platformUrl}">${platformUrl}</a></li>
                <li><strong>Support:</strong> Contact us if you have any questions</li>
              </ul>
              
              <p>We're excited to have you on board and look forward to a successful partnership!</p>
              
              <p><strong>The SCIMS Affiliate Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>© ${new Date().getFullYear()} SCIMS. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"SCIMS Affiliate Program" <${emailConfig.auth.user}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Affiliate approval email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async sendAffiliateRejectionEmail(data: AffiliateRejectionEmailData): Promise<EmailResult> {
    try {
      const { to, name, rejectionReason, platformUrl } = data;

      const subject = `Affiliate Application Update - SCIMS`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Affiliate Application Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .info { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .reason-box { background: #fff; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Affiliate Application Update</h1>
              <p>Thank you for your interest in SCIMS</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>Thank you for your interest in becoming an affiliate partner with <strong>SCIMS</strong>.</p>
              
              <p>After careful review, we regret to inform you that we are unable to approve your affiliate application at this time.</p>
              
              ${rejectionReason ? `
              <div class="reason-box">
                <h3 style="margin-top: 0; color: #dc2626;">Reason for Decision</h3>
                <p style="margin-bottom: 0;">${rejectionReason}</p>
              </div>
              ` : ''}
              
              <div class="info">
                <h3 style="margin-top: 0;">💡 What This Means</h3>
                <ul style="margin-bottom: 0;">
                  <li>This decision does not prevent you from reapplying in the future</li>
                  <li>We encourage you to address any concerns mentioned above</li>
                  <li>You can always reach out to us with questions</li>
                </ul>
              </div>
              
              <h3>🔄 Reapplying</h3>
              <p>If you believe circumstances have changed or you'd like to address the feedback provided, you are welcome to submit a new application at any time.</p>
              
              <p>You can reapply by visiting: <a href="${platformUrl}/affiliate/apply">${platformUrl}/affiliate/apply</a></p>
              
              <h3>📞 Questions?</h3>
              <p>If you have any questions about this decision or would like to discuss your application further, please don't hesitate to contact our support team.</p>
              
              <p>We appreciate your interest in SCIMS and wish you the best in your endeavors.</p>
              
              <p><strong>The SCIMS Affiliate Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${to}</p>
              <p>© ${new Date().getFullYear()} SCIMS. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"SCIMS Affiliate Program" <${emailConfig.auth.user}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Affiliate rejection email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
