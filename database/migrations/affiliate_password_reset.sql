-- Add password reset fields to affiliate table
ALTER TABLE public.affiliate 
ADD COLUMN IF NOT EXISTS password_reset_token character varying(255) NULL,
ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamp without time zone NULL;

-- Add index for password reset token lookup
CREATE INDEX IF NOT EXISTS idx_affiliate_password_reset_token 
  ON public.affiliate USING btree (password_reset_token);

