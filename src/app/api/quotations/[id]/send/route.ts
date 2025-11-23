import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';
import { createApiHandler } from '@/utils/api-wrapper';
import { successResponse, AppError } from '@/utils/api-errors';
import { createTransport } from 'nodemailer';
import { env } from '@/lib/env';

// POST - Send quotation via email
export const POST = createApiHandler(async ({ request, params }) => {
  const { id } = params!;

  // Get quotation with all details
  const { data: quotation, error: fetchError } = await supabase
    .from('quotation')
    .select(`
      *,
      business:business_id(id, name),
      store:store_id(id, name),
      items:quotation_item(
        *,
        product:product_id(id, name, sku)
      )
    `)
    .eq('id', id)
    .single();

  if (fetchError || !quotation) {
    throw new AppError('Quotation not found', 404, 'NOT_FOUND');
  }

  if (!quotation.customer_email) {
    throw new AppError('Customer email is required to send quotation', 400, 'VALIDATION_ERROR');
  }

  // Generate quotation HTML/PDF content (simplified - you can enhance this)
  const itemsHtml = quotation.items.map((item: {
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }) => `
    <tr>
      <td>${item.item_name}</td>
      <td>${item.quantity}</td>
      <td>${item.unit_price.toFixed(2)}</td>
      <td>${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <h2>Quotation ${quotation.quotation_number}</h2>
    <p>Dear ${quotation.customer_name},</p>
    <p>Please find attached our quotation for your consideration.</p>
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <p><strong>Subtotal:</strong> ${quotation.subtotal.toFixed(2)}</p>
    <p><strong>Tax:</strong> ${quotation.tax_amount.toFixed(2)}</p>
    <p><strong>Discount:</strong> ${quotation.discount_amount.toFixed(2)}</p>
    <p><strong>Total:</strong> ${quotation.total_amount.toFixed(2)}</p>
    ${quotation.bank_account_info ? `<p><strong>Bank Account:</strong> ${JSON.stringify(quotation.bank_account_info)}</p>` : ''}
    ${quotation.expires_at ? `<p><strong>Valid Until:</strong> ${new Date(quotation.expires_at).toLocaleDateString()}</p>` : ''}
    ${quotation.notes ? `<p><strong>Notes:</strong> ${quotation.notes}</p>` : ''}
  `;

  try {
    // Create email transporter
    const transporter = createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT),
      secure: parseInt(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: env.SMTP_USER,
      to: quotation.customer_email,
      subject: `Quotation ${quotation.quotation_number} from ${quotation.business?.name || 'SCIMS'}`,
      html: emailHtml,
    });

    // Update quotation status to 'sent'
    await supabase
      .from('quotation')
      .update({ status: 'sent' })
      .eq('id', id);

    return successResponse({ message: 'Quotation sent successfully' });
  } catch (emailError) {
    throw new AppError('Failed to send quotation email', 500, 'EMAIL_ERROR');
  }
}, { rateLimit: 'WRITE' });

