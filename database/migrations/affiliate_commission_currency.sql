-- Add currency_id field to affiliate_commission table (Issue #8)
-- This allows commissions to have a currency and enables currency changes

-- Add currency_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'affiliate_commission' 
    AND column_name = 'currency_id'
  ) THEN
    ALTER TABLE public.affiliate_commission 
    ADD COLUMN currency_id uuid NULL;
    
    -- Add foreign key constraint
    ALTER TABLE public.affiliate_commission 
    ADD CONSTRAINT affiliate_commission_currency_id_fkey 
    FOREIGN KEY (currency_id) 
    REFERENCES currency(id) ON DELETE SET NULL;
    
    -- Add index for performance
    CREATE INDEX IF NOT EXISTS idx_affiliate_commission_currency_id 
    ON public.affiliate_commission USING btree (currency_id);
  END IF;
END $$;

