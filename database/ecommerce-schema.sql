-- Add username/slug field to business table for custom URLs
ALTER TABLE public.business 
ADD COLUMN IF NOT EXISTS username CHARACTER VARYING(100) NULL,
ADD COLUMN IF NOT EXISTS slug CHARACTER VARYING(100) NULL;

-- Create unique index for username/slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_username ON public.business USING btree (username) TABLESPACE pg_default;
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_slug ON public.business USING btree (slug) TABLESPACE pg_default;

-- Add is_public field to product table for website visibility
ALTER TABLE public.product 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_description TEXT NULL,
ADD COLUMN IF NOT EXISTS public_images JSONB NULL DEFAULT '[]'::jsonb;

-- Create index for public products
CREATE INDEX IF NOT EXISTS idx_product_is_public ON public.product USING btree (is_public) TABLESPACE pg_default;

-- Create public orders table for ecommerce orders
CREATE TABLE IF NOT EXISTS public.public_order (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  store_id UUID NOT NULL,
  customer_name CHARACTER VARYING(255) NOT NULL,
  customer_phone CHARACTER VARYING(50) NOT NULL,
  customer_email CHARACTER VARYING(255) NULL,
  customer_address TEXT NULL,
  order_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status CHARACTER VARYING(20) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_message_id CHARACTER VARYING(255) NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT public_order_pkey PRIMARY KEY (id),
  CONSTRAINT public_order_business_id_fkey FOREIGN KEY (business_id) REFERENCES business (id) ON DELETE CASCADE,
  CONSTRAINT public_order_store_id_fkey FOREIGN KEY (store_id) REFERENCES store (id) ON DELETE CASCADE,
  CONSTRAINT public_order_status_check CHECK (
    status = ANY(ARRAY['pending', 'confirmed', 'processing', 'completed', 'cancelled'])
  )
) TABLESPACE pg_default;

-- Create indexes for public orders
CREATE INDEX IF NOT EXISTS idx_public_order_business_id ON public.public_order USING btree (business_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_public_order_store_id ON public.public_order USING btree (store_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_public_order_status ON public.public_order USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_public_order_created_at ON public.public_order USING btree (created_at) TABLESPACE pg_default;

-- Create trigger for updated_at
CREATE TRIGGER update_public_order_updated_at BEFORE UPDATE ON public.public_order FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add business settings for ecommerce
ALTER TABLE public.business_setting 
ADD COLUMN IF NOT EXISTS enable_public_store BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS store_theme CHARACTER VARYING(50) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS store_banner_url TEXT NULL,
ADD COLUMN IF NOT EXISTS store_description TEXT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_phone CHARACTER VARYING(50) NULL,
ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT NULL DEFAULT 'New order received from {customer_name}!\n\nOrder Details:\n{order_items}\n\nTotal: {total_amount}\n\nCustomer: {customer_name}\nPhone: {customer_phone}\nAddress: {customer_address}';

-- Update existing businesses to have default username/slug
UPDATE public.business 
SET username = LOWER(REPLACE(REPLACE(name, ' ', ''), '-', '')),
    slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-'))
WHERE username IS NULL OR slug IS NULL;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(business_name TEXT, business_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from business name
    base_slug := LOWER(REPLACE(REPLACE(REPLACE(business_name, ' ', '-'), '_', '-'), '.', ''));
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9-]', '', 'g');
    base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
    base_slug := TRIM(base_slug, '-');
    
    final_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    WHILE EXISTS (
        SELECT 1 FROM public.business 
        WHERE slug = final_slug 
        AND (business_id IS NULL OR id != business_id)
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update all businesses with unique slugs
UPDATE public.business 
SET slug = generate_unique_slug(name, id)
WHERE slug IS NULL OR slug = '';
