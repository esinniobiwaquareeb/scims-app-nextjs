-- Add user_id field to affiliate table to link affiliates to SCIMS user accounts (Issue #1)
-- This allows SCIMS customers to also be affiliates

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'affiliate' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.affiliate 
    ADD COLUMN user_id uuid NULL;
    
    -- Add foreign key constraint
    ALTER TABLE public.affiliate 
    ADD CONSTRAINT affiliate_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES "user"(id) ON DELETE SET NULL;
    
    -- Add index for performance
    CREATE INDEX IF NOT EXISTS idx_affiliate_user_id 
    ON public.affiliate USING btree (user_id);
  END IF;
END $$;

