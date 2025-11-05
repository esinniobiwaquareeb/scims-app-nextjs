-- ======================
-- AFFILIATE SYSTEM (SaaS - Business Signup Based)
-- ======================

-- Affiliates Table
-- For SaaS, affiliates are independent marketers who refer businesses to sign up
CREATE TABLE IF NOT EXISTS public.affiliate (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_code character varying(50) NOT NULL UNIQUE, -- Unique code for tracking
  name character varying(255) NOT NULL,
  email character varying(255) NOT NULL UNIQUE, -- Email for login and notifications
  phone character varying(50),
  password_hash character varying(255), -- Hashed password for affiliate login (optional, can be set after approval)
  -- Signup commission (one-time commission when business signs up)
  signup_commission_type character varying(20) DEFAULT 'percentage', -- 'percentage' or 'fixed'
  signup_commission_rate numeric(5, 2) NULL, -- Percentage commission for signup (e.g., 10.00 = 10%)
  signup_commission_fixed numeric(10, 2) NULL, -- Fixed commission amount for signup
  -- Subscription commission (recurring commission on subscription payments)
  subscription_commission_rate numeric(5, 2) NOT NULL DEFAULT 10.00, -- Percentage commission on subscriptions (e.g., 10.00 = 10%)
  -- Legacy fields (deprecated, kept for backward compatibility)
  commission_rate numeric(5, 2) DEFAULT 10.00, -- Legacy: use subscription_commission_rate
  commission_type character varying(20) DEFAULT 'percentage', -- Legacy field
  fixed_commission_amount numeric(10, 2) NULL, -- Legacy field
  status character varying(20) DEFAULT 'pending', -- 'pending', 'approved', 'active', 'suspended', 'inactive'
  application_status character varying(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payment_method character varying(50), -- 'bank_transfer', 'paypal', 'stripe', etc.
  payment_details jsonb, -- Store payment account details securely
  application_data jsonb, -- Store application form data (why they want to be affiliate, etc.)
  reviewed_by uuid NULL, -- User who reviewed the application
  reviewed_at timestamp without time zone NULL,
  rejection_reason text, -- Reason for rejection if application is rejected
  total_referrals integer DEFAULT 0, -- Number of business signups referred
  total_businesses integer DEFAULT 0, -- Number of businesses that signed up
  total_subscriptions numeric(12, 2) DEFAULT 0, -- Total subscription revenue from referrals
  total_commission_earned numeric(12, 2) DEFAULT 0,
  total_commission_paid numeric(12, 2) DEFAULT 0,
  total_commission_pending numeric(12, 2) DEFAULT 0,
  notes text,
  metadata jsonb, -- Store additional affiliate data
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  last_login timestamp without time zone NULL,
  CONSTRAINT affiliate_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_code_unique UNIQUE (affiliate_code),
  CONSTRAINT affiliate_email_unique UNIQUE (email),
  CONSTRAINT affiliate_commission_rate_check CHECK (commission_rate >= 0 AND commission_rate <= 100),
  CONSTRAINT affiliate_fixed_commission_amount_check CHECK (fixed_commission_amount IS NULL OR fixed_commission_amount >= 0),
  CONSTRAINT affiliate_status_check CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'inactive')),
  CONSTRAINT affiliate_application_status_check CHECK (application_status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT affiliate_reviewed_by_fkey FOREIGN KEY (reviewed_by) 
    REFERENCES "user"(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Affiliate Referrals Table (tracks business signups from affiliates)
CREATE TABLE IF NOT EXISTS public.affiliate_referral (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  business_id uuid NULL, -- The business that was referred and signed up
  user_email character varying(255), -- Email used during signup
  user_phone character varying(50),
  referral_code character varying(50) NOT NULL, -- The code used for referral
  referral_source character varying(50), -- 'link', 'code', 'social', etc.
  status character varying(20) DEFAULT 'pending', -- 'pending', 'converted', 'expired'
  converted_at timestamp without time zone NULL, -- When business completed signup
  subscription_started_at timestamp without time zone NULL, -- When business started paying
  expires_at timestamp without time zone NULL, -- Referral expiration date (default 90 days)
  metadata jsonb, -- Store referral tracking data (UTM params, source, etc.)
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT affiliate_referral_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_referral_affiliate_id_fkey FOREIGN KEY (affiliate_id) 
    REFERENCES affiliate(id) ON DELETE CASCADE,
  CONSTRAINT affiliate_referral_business_id_fkey FOREIGN KEY (business_id) 
    REFERENCES business(id) ON DELETE SET NULL,
  CONSTRAINT affiliate_referral_status_check CHECK (status IN ('pending', 'converted', 'expired'))
) TABLESPACE pg_default;

-- Affiliate Commissions Table (tracks commissions earned from signups and subscription payments)
CREATE TABLE IF NOT EXISTS public.affiliate_commission (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  referral_id uuid NULL, -- Link to the referral that generated this commission
  business_id uuid NOT NULL, -- The business that was referred
  subscription_plan_id uuid NULL, -- The subscription plan purchased (null for signup commissions)
  amount numeric(12, 2) NOT NULL, -- Base amount (subscription payment or signup value)
  commission_rate numeric(5, 2) NULL, -- Commission rate at time of commission (for percentage)
  commission_amount numeric(12, 2) NOT NULL, -- Calculated commission
  commission_type character varying(20) NOT NULL, -- 'signup' or 'subscription'
  commission_sub_type character varying(20) DEFAULT 'percentage', -- 'percentage' or 'fixed' (for signup)
  status character varying(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  payout_id uuid NULL, -- Link to payout when commission is paid (FK added after payout table is created)
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  paid_at timestamp without time zone NULL,
  CONSTRAINT affiliate_commission_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_commission_affiliate_id_fkey FOREIGN KEY (affiliate_id) 
    REFERENCES affiliate(id) ON DELETE CASCADE,
  CONSTRAINT affiliate_commission_referral_id_fkey FOREIGN KEY (referral_id) 
    REFERENCES affiliate_referral(id) ON DELETE SET NULL,
  CONSTRAINT affiliate_commission_business_id_fkey FOREIGN KEY (business_id) 
    REFERENCES business(id) ON DELETE CASCADE,
  -- Note: payout_id foreign key is added after affiliate_payout table is created (see below)
  CONSTRAINT affiliate_commission_status_check CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  CONSTRAINT affiliate_commission_commission_type_check CHECK (commission_type IN ('signup', 'subscription')),
  CONSTRAINT affiliate_commission_commission_amount_check CHECK (commission_amount >= 0),
  CONSTRAINT affiliate_commission_amount_check CHECK (amount >= 0)
) TABLESPACE pg_default;

-- Affiliate Payouts Table (tracks commission payouts to affiliates)
CREATE TABLE IF NOT EXISTS public.affiliate_payout (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  payout_number character varying(100) NOT NULL UNIQUE, -- Unique payout reference number
  total_amount numeric(12, 2) NOT NULL,
  commission_count integer NOT NULL, -- Number of commissions included in this payout
  payment_method character varying(50) NOT NULL,
  payment_details jsonb, -- Payment account details
  status character varying(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  processed_by uuid NULL, -- User who processed the payout
  processed_at timestamp without time zone NULL,
  notes text,
  transaction_reference character varying(255), -- External transaction reference
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT affiliate_payout_pkey PRIMARY KEY (id),
  CONSTRAINT affiliate_payout_affiliate_id_fkey FOREIGN KEY (affiliate_id) 
    REFERENCES affiliate(id) ON DELETE CASCADE,
  CONSTRAINT affiliate_payout_processed_by_fkey FOREIGN KEY (processed_by) 
    REFERENCES "user"(id) ON DELETE SET NULL,
  CONSTRAINT affiliate_payout_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT affiliate_payout_total_amount_check CHECK (total_amount > 0),
  CONSTRAINT affiliate_payout_commission_count_check CHECK (commission_count > 0)
) TABLESPACE pg_default;

-- Add the foreign key reference for payout_id after payout table is created
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_payout') THEN
    -- Drop constraint if it exists (in case of re-running migration)
    ALTER TABLE IF EXISTS public.affiliate_commission DROP CONSTRAINT IF EXISTS affiliate_commission_payout_id_fkey;
    
    -- Add the foreign key constraint
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'affiliate_commission_payout_id_fkey'
    ) THEN
      ALTER TABLE public.affiliate_commission 
        ADD CONSTRAINT affiliate_commission_payout_id_fkey 
        FOREIGN KEY (payout_id) REFERENCES affiliate_payout(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Indexes for Affiliates
CREATE INDEX IF NOT EXISTS idx_affiliate_code 
  ON public.affiliate USING btree (affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_status 
  ON public.affiliate USING btree (status);

-- Indexes for Affiliate Referrals
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_affiliate_id 
  ON public.affiliate_referral USING btree (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_business_id 
  ON public.affiliate_referral USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_code 
  ON public.affiliate_referral USING btree (referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referral_status 
  ON public.affiliate_referral USING btree (status);

-- Indexes for Affiliate Commissions
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_affiliate_id 
  ON public.affiliate_commission USING btree (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_referral_id 
  ON public.affiliate_commission USING btree (referral_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_business_id 
  ON public.affiliate_commission USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_status 
  ON public.affiliate_commission USING btree (status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_payout_id 
  ON public.affiliate_commission USING btree (payout_id);

-- Indexes for Affiliate Payouts
CREATE INDEX IF NOT EXISTS idx_affiliate_payout_affiliate_id 
  ON public.affiliate_payout USING btree (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payout_status 
  ON public.affiliate_payout USING btree (status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payout_payout_number 
  ON public.affiliate_payout USING btree (payout_number);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_updated_at BEFORE UPDATE ON public.affiliate
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_updated_at();

CREATE TRIGGER update_affiliate_referral_updated_at BEFORE UPDATE ON public.affiliate_referral
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_updated_at();

CREATE TRIGGER update_affiliate_commission_updated_at BEFORE UPDATE ON public.affiliate_commission
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_updated_at();

CREATE TRIGGER update_affiliate_payout_updated_at BEFORE UPDATE ON public.affiliate_payout
  FOR EACH ROW EXECUTE FUNCTION update_affiliate_updated_at();
