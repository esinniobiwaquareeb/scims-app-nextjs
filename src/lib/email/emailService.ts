import { createTransport } from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
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
}
