# AI Agent Setup Guide (SaaS Multi-Tenant)

This guide will help you connect your social media business accounts (WhatsApp, Instagram, TikTok) to the AI Agent system so it can automatically respond to customer messages.

**Important**: SCIMS is a SaaS platform serving multiple businesses. Each business needs to map their platform accounts to their business ID so messages are routed correctly.

## Prerequisites

1. **AI Agent Enabled**: Make sure AI Agent is enabled in Business Settings
2. **API Key Configured**: Add your OpenAI API key in Business Settings
3. **Public Webhook URL**: Your webhook URL must be publicly accessible via HTTPS
4. **Platform Mapping**: Map your platform account IDs to your business (done in Business Settings)

## Webhook URL

The webhook URL is shared across all businesses:
```
https://your-domain.com/api/ai-agent/webhook
```

The system automatically identifies which business a message belongs to using platform account mappings.

## Setup Process Overview

1. **Enable AI Agent** in Business Settings
2. **Map Platform Accounts** - Link your platform account IDs to your business
3. **Configure Webhook** in your platform's settings
4. **Test** by sending a message

## Step 1: Platform Account Mapping

Before configuring webhooks, you must map your platform account IDs to your business:

1. Go to **Business Settings** → **Integrations** tab
2. Scroll to **AI Agent Assistant** section
3. In **Platform Account Mapping**, click **"Add Mapping"**
4. Fill in:
   - **Platform**: Select WhatsApp, Instagram, or TikTok
   - **Platform Account ID**: Your platform's business account ID (see below for where to find it)
   - **Phone Number** (WhatsApp only): Your WhatsApp Business phone number
   - **Username** (Instagram/TikTok): Your account username
   - **App ID**: Your Meta App ID or TikTok App ID (optional)
5. Click **"Save Mapping"**

### Where to Find Platform Account IDs

**WhatsApp Business Account ID:**
- Meta Business Manager → WhatsApp → Your Business Account → Settings
- Look for "Business Account ID" or "Phone Number ID"

**Instagram Page ID:**
- Meta Business Manager → Instagram → Your Page → Settings
- Look for "Page ID" or check the page URL (page ID is in the URL)

**TikTok Business Account ID:**
- TikTok Developer Portal → Your App → Settings
- Look for "Business Account ID"

## Step 2: Platform-Specific Setup

### WhatsApp Business API

#### Step 1: Set Up WhatsApp Business Account
1. Go to [Meta Business Manager](https://business.facebook.com)
2. Navigate to **WhatsApp** → **Business Accounts**
3. Create or select your WhatsApp Business Account
4. Complete phone number verification
5. Note your Business Account ID

#### Step 2: Configure Webhook
1. In Meta Business Manager, go to **WhatsApp** → **Configuration** → **Webhooks**
2. Click **"Edit"** next to Webhook URL
3. Enter your webhook URL: `https://your-domain.com/api/ai-agent/webhook`
   - **Note**: This is the same URL for all businesses - the system identifies your business automatically
4. Set **Verify Token** (use a secure random string, e.g., `your_verify_token`)
   - Add this to your `.env` file as `WEBHOOK_VERIFY_TOKEN`
5. Subscribe to these events:
   - `messages`
   - `message_status`
6. Click **"Verify and Save"**

#### Step 3: Environment Variable
Add to your `.env` file:
```env
WEBHOOK_VERIFY_TOKEN=your_verify_token
```

#### Step 3: Map Your WhatsApp Account
1. Go to **Business Settings** → **AI Agent Assistant** → **Platform Account Mapping**
2. Add a new mapping:
   - Platform: **WhatsApp**
   - Platform Account ID: Your **WhatsApp Business Account ID** (from Meta Business Manager)
   - Phone Number: Your WhatsApp Business phone number (optional but recommended)
3. Save the mapping

#### Step 4: Test
Send a test message to your WhatsApp Business number. The AI agent should respond automatically.

### Instagram Business Messaging

#### Step 1: Set Up Instagram Business Account
1. Convert your Instagram account to **Business Account**
2. Connect your Instagram to a **Facebook Page**
3. Go to [Meta Developers](https://developers.facebook.com)
4. Create a new **Facebook App**
5. Add **Instagram Graph API** product
6. Get your **App ID** and **App Secret**

#### Step 2: Configure Webhook
1. In Facebook App Dashboard, go to **Messenger** → **Settings** → **Webhooks**
2. Click **"Add Callback URL"**
3. Enter your webhook URL: `https://your-domain.com/api/ai-agent/webhook`
4. Set **Verify Token** (same as WhatsApp)
5. Subscribe to these events:
   - `messages`
   - `messaging_postbacks`
   - `messaging_optins`
6. Click **"Verify and Save"**

#### Step 3: Enable Instagram Messaging
1. In Instagram settings, enable **"Allow Access to Messages"**
2. Authorize your app to access Instagram account
3. Test by sending a DM to your Instagram account

### Facebook Messenger

#### Step 1: Set Up Facebook Business Page
1. Go to [Meta Business Manager](https://business.facebook.com)
2. Create or select your Facebook Business Page
3. Ensure your page is verified and has Messenger enabled
4. Go to Page Settings → About to find your **Page ID**

#### Step 2: Create Facebook App
1. Go to [Meta Developers](https://developers.facebook.com)
2. Create a new app or select existing app
3. Add **Messenger** product to your app
4. Configure Messenger settings
5. Get your **App ID** and **App Secret**

#### Step 3: Configure Webhook
1. In Facebook App Dashboard, go to **Messenger** → **Settings** → **Webhooks**
2. Click **"Add Callback URL"** or **"Edit"**
3. Enter your webhook URL: `https://your-domain.com/api/ai-agent/webhook`
   - **Note**: This is the same URL for all businesses - the system identifies your business automatically
4. Set **Verify Token** (same as WhatsApp/Instagram)
5. Subscribe to these events:
   - `messages`
   - `messaging_postbacks`
   - `messaging_optins`
   - `messaging_deliveries`
   - `messaging_reads`
6. Click **"Verify and Save"**

#### Step 4: Link Page to App
1. In Messenger settings, go to **Access Tokens**
2. Select your Facebook Page from the dropdown
3. Generate a **Page Access Token**
4. Copy and save the token securely
5. Subscribe your page to the webhook

#### Step 5: Map Your Facebook Page
1. Go to **AI Agent Settings** → **Platform Account Mapping**
2. Add a new mapping:
   - Platform: **Facebook**
   - Platform Account ID: Your **Facebook Page ID**
   - App ID: Your **Facebook App ID** (optional but recommended)
3. Save the mapping

#### Step 6: Test
Send a test message to your Facebook Page through Messenger. The AI agent should respond automatically.

### TikTok Business Messaging (Beta)

⚠️ **Note**: TikTok Business Messaging API is currently in beta. You may need to apply for access.

#### Step 1: Apply for API Access
1. Go to [TikTok for Business](https://ads.tiktok.com)
2. Create a TikTok Ads account
3. Apply for API access through [TikTok Developer Portal](https://developers.tiktok.com)
4. Wait for approval (may take several days)

#### Step 2: Create TikTok App
1. Go to [TikTok Developers](https://developers.tiktok.com)
2. Create a new app
3. Add **"Messaging"** capability
4. Complete app verification
5. Get your **Client Key** and **Client Secret**

#### Step 3: Configure Webhook
1. In TikTok Developer Portal, go to your app → **Webhooks**
2. Add webhook endpoint
3. Enter your webhook URL: `https://your-domain.com/api/ai-agent/webhook`
4. Set **Webhook Secret** (for verification)
5. Subscribe to message events
6. Save configuration

## How Multi-Tenant Routing Works

Since SCIMS is SaaS, the same webhook URL handles messages for all businesses. Here's how it works:

1. **Platform sends webhook** → `https://your-domain.com/api/ai-agent/webhook`
2. **System extracts platform account ID** from webhook payload
3. **System looks up business ID** from `ai_agent_platform_mapping` table
4. **System loads AI config** for that specific business
5. **AI generates response** using that business's products and settings
6. **Response is sent back** to the customer

Each business must have their platform accounts mapped in the database before messages will be processed.

## Webhook Payload Format

The webhook accepts messages in multiple formats:

### Generic Format (Recommended for Testing)
```json
{
  "business_id": "your-business-id",
  "platform": "whatsapp",
  "conversation_id": "customer-phone-or-id",
  "message": "Hello, do you have products?",
  "phone": "+1234567890",
  "name": "Customer Name"
}
```

### Facebook Messenger API Format
```json
{
  "entry": [{
    "id": "page-id",
    "messaging": [{
      "sender": {
        "id": "user-id"
      },
      "recipient": {
        "id": "page-id"
      },
      "message": {
        "text": "Hello"
      },
      "timestamp": 1234567890
    }]
  }],
  "object": "page",
  "object_id": "your-business-id"
}
```

### WhatsApp Business API Format
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "text": {
            "body": "Hello"
          }
        }]
      },
      "metadata": {
        "business_id": "your-business-id"
      }
    }]
  }]
}
```

### Facebook Messenger API Format
```json
{
  "entry": [{
    "id": "page-id",
    "messaging": [{
      "sender": {
        "id": "user-id"
      },
      "recipient": {
        "id": "page-id"
      },
      "message": {
        "text": "Hello"
      }
    }]
  }],
  "object": "page"
}
```

### Instagram Messenger API Format
```json
{
  "entry": [{
    "messaging": [{
      "sender": {
        "id": "user-id"
      },
      "message": {
        "text": "Hello"
      }
    }]
  }],
  "object_id": "your-business-id"
}
```

## Testing the Webhook

### Using cURL
```bash
curl -X POST https://your-domain.com/api/ai-agent/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "your-business-id",
    "platform": "whatsapp",
    "conversation_id": "test-123",
    "message": "Hello, what products do you have?",
    "phone": "+1234567890"
  }'
```

### Using Postman
1. Create a new POST request
2. URL: `https://your-domain.com/api/ai-agent/webhook`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "business_id": "your-business-id",
  "platform": "whatsapp",
  "conversation_id": "test-123",
  "message": "What products are available?",
  "phone": "+1234567890"
}
```

## Troubleshooting

### Webhook Not Receiving Messages
1. **Check HTTPS**: Webhook URL must use HTTPS
2. **Verify Token**: Ensure verify token matches in platform settings
3. **Check Platform Status**: Verify webhook is subscribed to correct events
4. **Review Logs**: Check server logs for incoming webhook requests

### AI Not Responding
1. **Check AI Agent Status**: Ensure AI Agent is enabled in Business Settings
2. **Verify API Key**: Check OpenAI API key is valid
3. **Check Platform**: Ensure platform is enabled in AI Agent settings
4. **Review Conversation**: Check conversation history in database

### Platform-Specific Issues

#### WhatsApp
- Verify phone number is registered with WhatsApp Business API
- Check webhook is subscribed to `messages` event
- Ensure business account is verified

#### Instagram
- Verify Instagram account is connected to Facebook Page
- Check app has Instagram Messaging permissions
- Ensure webhook is verified in Facebook App settings

#### TikTok
- Verify API access is approved
- Check app has Messaging capability enabled
- Ensure webhook secret is configured correctly

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS for webhook URLs
2. **Verify Tokens**: Use strong, unique verify tokens
3. **Validate Payloads**: Verify webhook payloads match expected format
4. **Rate Limiting**: Implement rate limiting for webhook endpoints
5. **Monitor Logs**: Regularly review webhook access logs
6. **API Key Security**: Store API keys securely, never commit to version control

## Support

For issues or questions:
- Check the webhook logs in your server
- Review conversation history in the database
- Verify AI Agent configuration in Business Settings
- Contact support with webhook payload examples

