import { supabase } from '@/lib/supabase/config';

export interface AIAgentConfig {
  businessId: string;
  apiKey: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  enabledPlatforms: string[];
  autoOrder: boolean;
  responseDelayMs?: number;
}

export interface ProductInfo {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  sku?: string;
  category?: string;
  brand?: string;
  image_url?: string;
}

export interface BusinessInfo {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  businessHours?: string;
}

/**
 * Fetch AI agent configuration for a business
 */
export async function getAIAgentConfig(businessId: string): Promise<AIAgentConfig | null> {
  try {
    const { data: settings, error } = await supabase
      .from('business_setting')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (error || !settings) {
      console.error('Error fetching AI agent config:', error);
      return null;
    }

    if (!settings.enable_ai_agent || !settings.ai_agent_api_key) {
      return null;
    }

    return {
      businessId,
      apiKey: settings.ai_agent_api_key,
      model: settings.ai_agent_model || 'gpt-4',
      temperature: Number(settings.ai_agent_temperature) || 0.7,
      systemPrompt: settings.ai_agent_system_prompt || '',
      enabledPlatforms: settings.ai_agent_enabled_platforms || ['whatsapp'],
      autoOrder: settings.ai_agent_auto_order || false,
    };
  } catch (error) {
    console.error('Error in getAIAgentConfig:', error);
    return null;
  }
}

/**
 * Fetch products for a business (for AI agent context)
 */
export async function getBusinessProducts(businessId: string): Promise<ProductInfo[]> {
  try {
    // Get all stores for the business
    const { data: stores, error: storesError } = await supabase
      .from('store')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (storesError || !stores || stores.length === 0) {
      return [];
    }

    const storeIds = stores.map(store => store.id);

    // Fetch products
    const { data: products, error } = await supabase
      .from('product')
      .select(`
        id,
        name,
        description,
        price,
        stock_quantity,
        sku,
        image_url,
        category:category_id(name),
        brand:brand_id(name)
      `)
      .in('store_id', storeIds)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (products || []).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      price: Number(product.price) || 0,
      stock_quantity: Number(product.stock_quantity) || 0,
      sku: product.sku || undefined,
      category: (product.category as { name?: string } | null)?.name || undefined,
      brand: (product.brand as { name?: string } | null)?.name || undefined,
      image_url: product.image_url || undefined,
    }));
  } catch (error) {
    console.error('Error in getBusinessProducts:', error);
    return [];
  }
}

/**
 * Fetch business information for AI context
 */
export async function getBusinessInfo(businessId: string): Promise<BusinessInfo | null> {
  try {
    const { data: business, error } = await supabase
      .from('business')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error || !business) {
      console.error('Error fetching business info:', error);
      return null;
    }

    return {
      name: business.name,
      description: business.description || undefined,
      address: business.address || undefined,
      phone: business.phone || undefined,
      email: business.email || undefined,
      website: business.website || undefined,
    };
  } catch (error) {
    console.error('Error in getBusinessInfo:', error);
    return null;
  }
}

/**
 * Generate AI response using OpenAI API
 */
export async function generateAIResponse(
  config: AIAgentConfig,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context: {
    products: ProductInfo[];
    business: BusinessInfo | null;
  }
): Promise<string> {
  try {
    // Build context prompt
    const contextPrompt = buildContextPrompt(context.products, context.business);

    // Prepare messages with system prompt and context
    const systemMessage = {
      role: 'system' as const,
      content: `${config.systemPrompt}\n\n${contextPrompt}\n\nIMPORTANT: 
- Always be helpful, friendly, and professional
- When asked about products, provide accurate pricing and availability
- If a product is out of stock, inform the customer clearly
- For orders, collect customer name, phone, address, and items
- If auto-order is enabled, you can create orders directly
- Always confirm order details before processing payments`,
    };

    const messagesWithContext = [systemMessage, ...messages];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: messagesWithContext,
        temperature: config.temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Build context prompt from products and business info
 */
function buildContextPrompt(products: ProductInfo[], business: BusinessInfo | null): string {
  let prompt = '';

  if (business) {
    prompt += `Business Information:\n`;
    prompt += `- Name: ${business.name}\n`;
    if (business.description) prompt += `- Description: ${business.description}\n`;
    if (business.address) prompt += `- Address: ${business.address}\n`;
    if (business.phone) prompt += `- Phone: ${business.phone}\n`;
    if (business.email) prompt += `- Email: ${business.email}\n`;
    if (business.website) prompt += `- Website: ${business.website}\n`;
    prompt += `\n`;
  }

  if (products.length > 0) {
    prompt += `Available Products (${products.length} total):\n`;
    // Limit to first 50 products for context
    const limitedProducts = products.slice(0, 50);
    limitedProducts.forEach(product => {
      prompt += `- ${product.name}`;
      if (product.sku) prompt += ` (SKU: ${product.sku})`;
      prompt += `: ${formatCurrency(product.price)}`;
      if (product.stock_quantity > 0) {
        prompt += ` - In Stock (${product.stock_quantity} available)`;
      } else {
        prompt += ` - OUT OF STOCK`;
      }
      if (product.category) prompt += ` [Category: ${product.category}]`;
      if (product.brand) prompt += ` [Brand: ${product.brand}]`;
      prompt += `\n`;
    });
    if (products.length > 50) {
      prompt += `\n... and ${products.length - 50} more products. Use search to find specific items.\n`;
    }
  } else {
    prompt += `No products are currently available.\n`;
  }

  return prompt;
}

/**
 * Format currency (simplified - should use actual currency from business settings)
 */
function formatCurrency(amount: number): string {
  return `₦${amount.toFixed(2)}`;
}

/**
 * Search products by query
 */
export async function searchProducts(businessId: string, query: string): Promise<ProductInfo[]> {
  const allProducts = await getBusinessProducts(businessId);
  const lowerQuery = query.toLowerCase();
  
  return allProducts.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description?.toLowerCase().includes(lowerQuery) ||
    product.sku?.toLowerCase().includes(lowerQuery) ||
    product.category?.toLowerCase().includes(lowerQuery) ||
    product.brand?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get or create conversation
 */
export async function getOrCreateConversation(
  businessId: string,
  platform: string,
  conversationId: string,
  customerInfo: {
    phone?: string;
    username?: string;
    name?: string;
  }
) {
  try {
    // Try to find existing conversation
    const { data: existing, error: findError } = await supabase
      .from('ai_agent_conversation')
      .select('*')
      .eq('business_id', businessId)
      .eq('platform', platform)
      .eq('conversation_id', conversationId)
      .single();

    if (existing && !findError) {
      // Update last message time
      await supabase
        .from('ai_agent_conversation')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', existing.id);
      return existing;
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('ai_agent_conversation')
      .insert({
        business_id: businessId,
        platform,
        conversation_id: conversationId,
        customer_phone: customerInfo.phone,
        customer_username: customerInfo.username,
        customer_name: customerInfo.name,
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      throw createError;
    }

    return newConversation;
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    throw error;
  }
}

/**
 * Save message to conversation
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  messageType: string = 'text',
  metadata?: Record<string, unknown>
) {
  try {
    const { data, error } = await supabase
      .from('ai_agent_message')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        message_type: messageType,
        metadata: (metadata || {}) as Record<string, unknown>,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    throw error;
  }
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(conversationId: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('ai_agent_message')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
}

