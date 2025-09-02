-- Add email verification fields to user table
ALTER TABLE public.user 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token CHARACTER VARYING(255) NULL,
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITHOUT TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS password_reset_token CHARACTER VARYING(255) NULL,
ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP WITHOUT TIME ZONE NULL;

-- Create index for email verification token
CREATE INDEX IF NOT EXISTS idx_user_email_verification_token ON public.user USING btree (email_verification_token) TABLESPACE pg_default;

-- Create index for password reset token
CREATE INDEX IF NOT EXISTS idx_user_password_reset_token ON public.user USING btree (password_reset_token) TABLESPACE pg_default;

-- Create index for email verification status
CREATE INDEX IF NOT EXISTS idx_user_email_verified ON public.user USING btree (email_verified) TABLESPACE pg_default;
