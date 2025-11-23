-- ======================
-- UNIT MANAGEMENT SYSTEM
-- ======================
-- Allows businesses to create and manage custom units for products

CREATE TABLE IF NOT EXISTS public.unit (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name character varying(100) NOT NULL,
  symbol character varying(20) NULL, -- e.g., "kg", "L", "pcs"
  description text NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT unit_pkey PRIMARY KEY (id),
  CONSTRAINT unit_business_id_fkey FOREIGN KEY (business_id) 
    REFERENCES business(id) ON DELETE CASCADE,
  CONSTRAINT unit_business_name_unique UNIQUE (business_id, name)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_unit_business_id 
  ON public.unit(business_id);

CREATE INDEX IF NOT EXISTS idx_unit_is_active 
  ON public.unit(is_active);

CREATE INDEX IF NOT EXISTS idx_unit_sort_order 
  ON public.unit(sort_order);

CREATE TRIGGER update_unit_updated_at 
  BEFORE UPDATE ON unit 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default units for existing businesses
-- This will be handled by the application when businesses access units for the first time
-- Or we can create a function to seed default units

-- Default units that should be available
-- These can be created via the UI or seeded on business creation
-- Common units: piece, packet, dozen, box, kg, g, liter, ml, meter, cm, etc.

