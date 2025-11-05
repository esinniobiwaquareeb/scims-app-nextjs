import { NextRequest, NextResponse } from 'next/server';
import {
  getAIAgentConfig,
  getBusinessProducts,
  getBusinessInfo,
  generateAIResponse,
  getOrCreateConversation,
  saveMessage,
  getConversationMessages,
} from '@/utils/ai-agent/aiAgentService';
import { getBusinessIdFromPlatform } from '@/utils/ai-agent/platformMapping';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * AI Agent Webhook Handler
 * Handles incoming messages from WhatsApp, Instagram, TikTok, etc.
 * 
 * Supports multiple webhook formats:
 * - Generic format: { business_id, platform, conversation_id, message, phone, username, name }
 * - WhatsApp format: { entry: [{ changes: [{ value: { messages: [...] } }] }] }
 * - Instagram format: { entry: [{ messaging: [...] }] }
 * - TikTok format: { event: { message: { ... } } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Try to extract data from different webhook formats
    let businessId: string | null = null;
    let platform = 'whatsapp';
    let conversationId: string | null = null;
    let message = '';
    let customerInfo: { phone?: string; username?: string; name?: string } = {};
    let platformAccountId: string | null = null;
    let platformPhoneNumber: string | undefined;

    // Format 1: Generic/Simple format (for testing - requires business_id)
    if (body.business_id && body.message) {
      businessId = body.business_id;
      platform = body.platform || 'whatsapp';
      conversationId = body.conversation_id || body.from || body.user_id || body.phone;
      message = body.message || body.text || body.content || '';
      customerInfo = {
        phone: body.phone || body.from,
        username: body.username || body.user_id,
        name: body.name || body.customer_name,
      };
      platformAccountId = body.platform_account_id || body.business_id;
    }
    // Format 2: WhatsApp Business API format
    else if (body.entry && Array.isArray(body.entry)) {
      const entry = body.entry[0];
      if (entry.changes && Array.isArray(entry.changes)) {
        const change = entry.changes[0];
        if (change.value && change.value.messages) {
          const messageData = change.value.messages[0];
          const value = change.value;
          
          platform = 'whatsapp';
          conversationId = messageData.from;
          message = messageData.text?.body || messageData.body?.text || '';
          customerInfo.phone = messageData.from;
          
          // Extract platform account ID from WhatsApp Business Account ID
          platformAccountId = value.metadata?.phone_number_id || 
                             value.metadata?.business_account_id ||
                             value.business_account_id ||
                             entry.id;
          
          platformPhoneNumber = value.metadata?.phone_number_id || 
                               value.metadata?.display_phone_number;
          
          // Look up business ID from platform mapping
          if (platformAccountId) {
            businessId = await getBusinessIdFromPlatform(
              platform,
              platformAccountId,
              platformPhoneNumber
            );
          }
        }
      }
    }
    // Format 3: Instagram Messenger API format
    else if (body.entry && Array.isArray(body.entry) && body.entry[0].messaging) {
      const messaging = body.entry[0].messaging[0];
      const entry = body.entry[0];
      
      platform = 'instagram';
      conversationId = messaging.sender?.id || messaging.from?.id;
      message = messaging.message?.text || '';
      customerInfo.username = messaging.sender?.id;
      
      // Extract platform account ID (Page ID or App ID)
      platformAccountId = entry.id || 
                         messaging.recipient?.id ||
                         body.object || // Instagram Page ID
                         null;
      
      // Look up business ID from platform mapping
      if (platformAccountId) {
        businessId = await getBusinessIdFromPlatform(
          platform,
          platformAccountId
        );
      }
    }
    // Format 4: Facebook Messenger API format
    else if (body.entry && Array.isArray(body.entry) && body.entry[0].messaging && body.object === 'page') {
      const messaging = body.entry[0].messaging[0];
      const entry = body.entry[0];
      
      platform = 'facebook';
      conversationId = messaging.sender?.id || messaging.from?.id;
      message = messaging.message?.text || '';
      customerInfo.username = messaging.sender?.id;
      
      // Extract platform account ID (Facebook Page ID)
      platformAccountId = entry.id || 
                         messaging.recipient?.id ||
                         body.object_id || // Page ID
                         null;
      
      // Look up business ID from platform mapping
      if (platformAccountId) {
        businessId = await getBusinessIdFromPlatform(
          platform,
          platformAccountId
        );
      }
    }
    // Format 5: TikTok format
    else if (body.event && body.event.message) {
      const event = body.event;
      
      platform = 'tiktok';
      conversationId = event.sender?.user_id || event.message.sender_id;
      message = event.message.text || '';
      customerInfo.username = event.sender?.user_id;
      
      // Extract platform account ID (TikTok Business Account ID)
      platformAccountId = event.business_account_id ||
                         event.app_id ||
                         body.app_id ||
                         null;
      
      // Look up business ID from platform mapping
      if (platformAccountId) {
        businessId = await getBusinessIdFromPlatform(
          platform,
          platformAccountId
        );
      }
    }

    if (!businessId || !conversationId || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields. Please provide business_id, conversation_id (or from/phone), and message' 
        },
        { status: 400 }
      );
    }

    // Get AI agent configuration
    const config = await getAIAgentConfig(businessId);
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'AI agent not enabled or not configured for this business' },
        { status: 400 }
      );
    }

    // Check if platform is enabled
    if (!config.enabledPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, error: `AI agent not enabled for platform: ${platform}` },
        { status: 400 }
      );
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(
      businessId,
      platform,
      conversationId,
      customerInfo
    );

    // Save user message
    await saveMessage(conversation.id, 'user', message, 'text');

    // Get conversation history (last 10 messages for context)
    const messageHistory = await getConversationMessages(conversation.id, 10);
    
    // Prepare messages for AI
    const aiMessages = messageHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Get business context
    const [products, business] = await Promise.all([
      getBusinessProducts(businessId),
      getBusinessInfo(businessId),
    ]);

    // Generate AI response
    const aiResponse = await generateAIResponse(
      config,
      aiMessages,
      { products, business }
    );

    // Save AI response
    await saveMessage(conversation.id, 'assistant', aiResponse, 'text');

    // Add delay if configured (to simulate human-like response time)
    if (config.responseDelayMs) {
      await new Promise(resolve => setTimeout(resolve, config.responseDelayMs || 1000));
    }

    // Return response (platforms will handle sending the message)
    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversation_id: conversation.id,
      // Include platform-specific response format if needed
      ...(platform === 'whatsapp' && {
        messages: [{
          to: conversationId,
          text: { body: aiResponse }
        }]
      }),
      ...((platform === 'instagram' || platform === 'facebook') && {
        message: {
          text: aiResponse
        }
      }),
    });

  } catch (error) {
    console.error('Error in AI agent webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Health check and webhook verification
 * Supports webhook verification for WhatsApp, Instagram (Meta), and TikTok
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // WhatsApp/Instagram (Meta) webhook verification
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    // Verify token (should match your configured token)
    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || 'your_verify_token';
    
    if (mode === 'subscribe' && token === verifyToken) {
      return new NextResponse(challenge, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 403 }
      );
    }
  }

  // TikTok webhook verification
  const tiktokChallenge = searchParams.get('challenge');
  const tiktokToken = searchParams.get('token');
  
  if (tiktokChallenge && tiktokToken) {
    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || 'your_verify_token';
    if (tiktokToken === verifyToken) {
      return new NextResponse(tiktokChallenge, { status: 200 });
    }
  }

  // Health check
  return NextResponse.json({
    success: true,
    message: 'AI Agent Webhook is active',
    timestamp: new Date().toISOString(),
    supported_platforms: ['whatsapp', 'instagram', 'tiktok', 'facebook'],
    webhook_url: '/api/ai-agent/webhook',
  });
}
