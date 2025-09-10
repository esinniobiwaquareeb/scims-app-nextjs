import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total_price: number;
}

interface CustomerOrderData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  businessName: string;
  orderItems: OrderItem[];
  totalAmount: number;
  currency: string;
}

interface BusinessOrderData {
  businessEmail: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderNumber: string;
  orderItems: OrderItem[];
  totalAmount: number;
  currency: string;
  notes?: string;
}

export async function sendOrderConfirmationEmail(data: CustomerOrderData) {
  const orderItemsHtml = data.orderItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${data.currency}${item.price.toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${data.currency}${item.total_price.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${data.businessName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #A969A7; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #A969A7; color: white; padding: 12px; text-align: left; }
        .order-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order, ${data.customerName}!</p>
        </div>
        <div class="content">
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> #${data.orderNumber}</p>
          <p><strong>Business:</strong> ${data.businessName}</p>
          
          <h3>Order Items</h3>
          <table class="order-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            Total Amount: ${data.currency}${data.totalAmount.toLocaleString()}
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Your order has been sent to ${data.businessName} via WhatsApp</li>
            <li>The business will contact you to confirm the order and payment details</li>
            <li>You can download your receipt as a PDF from the order confirmation page</li>
          </ul>
          
          <p>If you have any questions, please contact ${data.businessName} directly.</p>
        </div>
        <div class="footer">
          <p>This email was sent automatically by SCIMS (Stock Control Inventory Management System)</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderNumber} - ${data.businessName}`,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', data.customerEmail);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

export async function sendBusinessOrderNotification(data: BusinessOrderData) {
  const orderItemsHtml = data.orderItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${data.currency}${item.price.toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${data.currency}${item.total_price.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Received - ${data.businessName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #A969A7; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #A969A7; color: white; padding: 12px; text-align: left; }
        .order-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .customer-info { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .urgent { color: #d32f2f; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Received!</h1>
          <p class="urgent">Action Required</p>
        </div>
        <div class="content">
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> #${data.orderNumber}</p>
          <p><strong>Business:</strong> ${data.businessName}</p>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Phone:</strong> ${data.customerPhone}</p>
            ${data.customerEmail ? `<p><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
          </div>
          
          <h3>Order Items</h3>
          <table class="order-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            Total Amount: ${data.currency}${data.totalAmount.toLocaleString()}
          </div>
          
          ${data.notes ? `
            <h3>Special Instructions</h3>
            <p>${data.notes}</p>
          ` : ''}
          
          <h3>Next Steps</h3>
          <ul>
            <li>Contact the customer to confirm the order</li>
            <li>Verify payment details and method</li>
            <li>Confirm delivery/pickup arrangements</li>
            <li>Update order status in your SCIMS dashboard</li>
          </ul>
          
          <p class="urgent">Please respond to the customer promptly to confirm their order.</p>
        </div>
        <div class="footer">
          <p>This notification was sent automatically by SCIMS (Stock Control Inventory Management System)</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: data.businessEmail,
    subject: `New Order #${data.orderNumber} - ${data.customerName}`,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Business order notification sent to:', data.businessEmail);
  } catch (error) {
    console.error('Failed to send business order notification:', error);
    throw error;
  }
}
