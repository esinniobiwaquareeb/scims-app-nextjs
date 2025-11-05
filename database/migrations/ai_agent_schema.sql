-- ======================
-- AI AGENT SYSTEM
-- ======================

-- AI Agent Settings (extends business_setting)
-- Add columns to business_setting table for AI agent configuration
ALTER TABLE public.business_setting 
ADD COLUMN IF NOT EXISTS enable_ai_agent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_agent_provider character varying(50) DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS ai_agent_api_key text,
ADD COLUMN IF NOT EXISTS ai_agent_model character varying(100) DEFAULT 'gpt-4',
ADD COLUMN IF NOT EXISTS ai_agent_temperature numeric(3, 2) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS ai_agent_system_prompt text DEFAULT 'You are a helpful customer service agent for a retail business. You help customers find products, check availability, get pricing, and answer questions about the business.',
ADD COLUMN IF NOT EXISTS ai_agent_enabled_platforms jsonb DEFAULT '["whatsapp"]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_agent_auto_order boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_agent_response_delay_ms integer DEFAULT 1000;

-- AI Agent Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_agent_conversation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  platform character varying(50) NOT NULL, -- 'whatsapp', 'instagram', 'tiktok'
  customer_phone character varying(50),
  customer_username character varying(255),
  customer_name character varying(255),
  conversation_id character varying(255) NOT NULL, -- Platform-specific conversation ID
  status character varying(50) DEFAULT 'active', -- 'active', 'completed', 'escalated'
  metadata jsonb, -- Store platform-specific data
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  last_message_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_agent_conversation_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_conversation_business_id_fkey FOREIGN KEY (business_id) 
    REFERENCES business(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- AI Agent Messages Table
CREATE TABLE IF NOT EXISTS public.ai_agent_message (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  role character varying(20) NOT NULL, -- 'user', 'assistant', 'system'
  content text NOT NULL,
  message_type character varying(50) DEFAULT 'text', -- 'text', 'image', 'location', 'order', 'payment'
  metadata jsonb, -- Store additional data like product IDs, order info, etc.
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_agent_message_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_message_conversation_id_fkey FOREIGN KEY (conversation_id) 
    REFERENCES ai_agent_conversation(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- AI Agent Orders Table (for tracking orders created via AI agent)
CREATE TABLE IF NOT EXISTS public.ai_agent_order (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  order_id uuid, -- Link to actual order if created
  customer_name character varying(255),
  customer_phone character varying(50),
  customer_address text,
  items jsonb NOT NULL, -- Array of {product_id, quantity, price}
  total_amount numeric(10, 2) NOT NULL,
  status character varying(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  payment_method character varying(50),
  payment_status character varying(50) DEFAULT 'pending',
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_agent_order_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_order_conversation_id_fkey FOREIGN KEY (conversation_id) 
    REFERENCES ai_agent_conversation(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- AI Agent Platform Mapping Table (SaaS Multi-Tenant Support)
-- Maps platform account IDs to business IDs for automatic routing
CREATE TABLE IF NOT EXISTS public.ai_agent_platform_mapping (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  platform character varying(50) NOT NULL, -- 'whatsapp', 'instagram', 'tiktok', 'facebook'
  platform_account_id character varying(255) NOT NULL, -- Platform-specific account ID
  platform_phone_number character varying(50), -- For WhatsApp
  platform_username character varying(255), -- For Instagram/TikTok
  platform_app_id character varying(255), -- Meta App ID, TikTok App ID, etc.
  platform_secret character varying(255), -- For webhook verification
  is_active boolean DEFAULT true,
  metadata jsonb, -- Store additional platform-specific data
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ai_agent_platform_mapping_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_platform_mapping_business_id_fkey FOREIGN KEY (business_id) 
    REFERENCES business(id) ON DELETE CASCADE,
  CONSTRAINT ai_agent_platform_mapping_unique UNIQUE (platform, platform_account_id)
) TABLESPACE pg_default;

-- Indexes for AI Agent Conversations
CREATE INDEX IF NOT EXISTS idx_ai_agent_conversation_business_id 
  ON public.ai_agent_conversation USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_conversation_conversation_id 
  ON public.ai_agent_conversation USING btree (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_conversation_status 
  ON public.ai_agent_conversation USING btree (status);

-- Indexes for AI Agent Messages
CREATE INDEX IF NOT EXISTS idx_ai_agent_message_conversation_id 
  ON public.ai_agent_message USING btree (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_message_created_at 
  ON public.ai_agent_message USING btree (created_at);

-- Indexes for AI Agent Orders
CREATE INDEX IF NOT EXISTS idx_ai_agent_order_conversation_id 
  ON public.ai_agent_order USING btree (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_order_status 
  ON public.ai_agent_order USING btree (status);

-- Indexes for AI Agent Platform Mapping (SaaS Multi-Tenant)
CREATE INDEX IF NOT EXISTS idx_ai_agent_platform_mapping_business_id 
  ON public.ai_agent_platform_mapping USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_platform_mapping_platform_account 
  ON public.ai_agent_platform_mapping USING btree (platform, platform_account_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_platform_mapping_phone 
  ON public.ai_agent_platform_mapping USING btree (platform_phone_number) 
  WHERE platform_phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_agent_platform_mapping_active 
  ON public.ai_agent_platform_mapping USING btree (is_active) 
  WHERE is_active = true;

-- Trigger to update updated_at for conversations
CREATE OR REPLACE FUNCTION update_ai_agent_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_agent_conversation_updated_at
  BEFORE UPDATE ON public.ai_agent_conversation
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_agent_conversation_updated_at();

-- Trigger to update updated_at for orders (uses existing function)
CREATE TRIGGER update_ai_agent_order_updated_at
  BEFORE UPDATE ON public.ai_agent_order
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for platform mapping (uses existing function)
CREATE TRIGGER update_ai_agent_platform_mapping_updated_at
  BEFORE UPDATE ON public.ai_agent_platform_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
