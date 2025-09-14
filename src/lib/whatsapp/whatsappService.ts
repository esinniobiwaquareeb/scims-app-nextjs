interface WhatsAppMessage {
  to: string;
  message: string;
  businessId: string;
}

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  whatsappUrl?: string;
  error?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  async sendMessage(messageData: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      const { to, message } = messageData;
      
      // Format phone number (remove any non-digit characters and ensure it starts with country code)
      const formattedPhone = this.formatPhoneNumber(to);
      
      if (!formattedPhone) {
        return {
          success: false,
          error: 'Invalid phone number format'
        };
      }

      // Generate WhatsApp web URL - this is much simpler and more reliable
      const whatsappUrl = this.generateWhatsAppUrl(formattedPhone, message);
      
      // Log the message for debugging
      console.log('WhatsApp Message to send:', {
        to: formattedPhone,
        message: message,
        whatsappUrl: whatsappUrl
      });

      // Return success with the URL - the user will need to click it to send
      return {
        success: true,
        messageId: `web_${Date.now()}`, // Generate a unique ID for tracking
        whatsappUrl: whatsappUrl
      };
    } catch (error) {
      console.error('WhatsApp Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with country code, return as is
    if (digits.length >= 10) {
      return digits;
    }
    
    // If it's a local number, assume it needs a country code
    // This is a fallback - ideally the business should store the full international number
    if (digits.length >= 10) {
      return digits;
    }
    
    return null;
  }

  // Generate WhatsApp web URL using the api.whatsapp.com format
  generateWhatsAppUrl(phone: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) {
      return '';
    }
    
    // Clean and format the message for better WhatsApp compatibility
    const cleanedMessage = this.cleanMessageForWhatsApp(message);
    const encodedMessage = encodeURIComponent(cleanedMessage);
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  }

  // Clean message for better WhatsApp compatibility
  private cleanMessageForWhatsApp(message: string): string {
    return message
      // Ensure proper line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Ensure proper spacing around special characters
      .replace(/\*\s+/g, '*')
      .replace(/\s+\*/g, '*')
      // Clean up any trailing whitespace
      .trim();
  }
}

// Factory function to create WhatsApp service for a business
export async function createWhatsAppService(businessId: string): Promise<WhatsAppService | null> {
  try {
    // Since we're using the web API, we don't need complex credentials
    // Just create a simple service instance
    return new WhatsAppService({
      accessToken: '', // Not needed for web API
      phoneNumberId: '', // Not needed for web API
      businessAccountId: businessId // Use business ID for tracking
    });
  } catch (error) {
    console.error('Error creating WhatsApp service:', error);
    return null;
  }
}

// Utility function to send WhatsApp message using web API
export async function sendWhatsAppMessage(
  businessId: string,
  phone: string,
  message: string
): Promise<{ success: boolean; whatsappUrl?: string; error?: string }> {
  try {
    const whatsappService = await createWhatsAppService(businessId);
    
    if (!whatsappService) {
      return {
        success: false,
        error: 'Failed to create WhatsApp service'
      };
    }

    const result = await whatsappService.sendMessage({
      to: phone,
      message,
      businessId
    });

    return {
      success: result.success,
      whatsappUrl: result.whatsappUrl,
      error: result.error
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
