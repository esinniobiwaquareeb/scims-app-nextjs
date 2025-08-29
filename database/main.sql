-- Activity Log
create table public.activity_log (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  business_id uuid null,
  store_id uuid null,
  activity_type character varying(50) not null,
  category character varying(100) not null,
  description text not null,
  metadata jsonb null,
  ip_address inet null,
  user_agent text null,
  created_at timestamp without time zone null default now(),
  constraint activity_log_pkey primary key (id),
  constraint activity_log_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint activity_log_user_id_fkey foreign KEY (user_id) references user (id) on delete set null,
  constraint activity_log_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_activity_log_user_id on public.activity_log using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_activity_log_created_at on public.activity_log using btree (created_at) TABLESPACE pg_default;
create index IF not exists idx_activity_log_business_id on public.activity_log using btree (business_id) TABLESPACE pg_default;


-- Brand
create table public.brand (
  id uuid not null default extensions.uuid_generate_v4 (),
  business_id uuid null,
  name character varying(255) not null,
  description text null,
  logo_url text null,
  website character varying(255) null,
  contact_person character varying(255) null,
  contact_email character varying(255) null,
  contact_phone character varying(50) null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint brand_pkey primary key (id),
  constraint brand_business_id_name_key unique (business_id, name),
  constraint brand_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_brand_business_id on public.brand using btree (business_id) TABLESPACE pg_default;


-- Business
create table public.business (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  description text null,
  business_type character varying(50) null default 'retail',
  timezone character varying(50) null default 'UTC'::character varying,
  subscription_status character varying(20) null default 'active'::character varying,
  subscription_expires_at timestamp without time zone null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  address text null,
  email character varying null,
  phone character varying null,
  website character varying null,
  subscription_plan_id uuid null,
  currency_id uuid null,
  language_id uuid null,
  country_id uuid null,
  constraint business_pkey primary key (id),
  constraint business_subscription_plan_id_fkey foreign KEY (subscription_plan_id) references subscription_plan (id) on delete set null,
  constraint business_country_id_fkey foreign KEY (country_id) references country (id) on delete set null,
  constraint business_currency_id_fkey foreign KEY (currency_id) references currency (id) on delete set null,
  constraint business_language_id_fkey foreign KEY (language_id) references language (id) on delete set null,
  constraint business_subscription_status_check check (
    (
      (subscription_status)::text = any (
        array[
          'active'::text,
          'expired'::text,
          'cancelled'::text,
          'suspended'::text
        ]
      )
    )
  ),
  constraint business_type_check check (
    (
      (business_type)::text = any (
        array[
          'retail'::text,
          'restaurant'::text,
          'service'::text,
          'hybrid'::text,
          'pharmacy'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_business_currency_id on public.business using btree (currency_id) TABLESPACE pg_default;
create index IF not exists idx_business_language_id on public.business using btree (language_id) TABLESPACE pg_default;
create index IF not exists idx_business_country_id on public.business using btree (country_id) TABLESPACE pg_default;

create trigger update_business_updated_at BEFORE
update on business for EACH row
execute FUNCTION update_updated_at_column ();


-- Business Setting
create table public.business_setting (
  id uuid not null default gen_random_uuid (),
  business_id uuid not null,
  tax_rate numeric(5, 2) null default 0.00,
  enable_tax boolean null default false,
  allow_returns boolean null default true,
  return_period_days integer null default 30,
  enable_sounds boolean null default true,
  logo_url text null,
  primary_color character varying(7) null default '#3B82F6'::character varying,
  secondary_color character varying(7) null default '#10B981'::character varying,
  accent_color character varying(7) null default '#F59E0B'::character varying,
  receipt_header text null default 'Thank you for shopping with us!'::text,
  receipt_footer text null default 'Returns accepted within 30 days with receipt.'::text,
  return_policy text null default 'Returns accepted within 30 days with original receipt.'::text,
  warranty_info text null default 'Standard manufacturer warranty applies.'::text,
  terms_of_service text null,
  privacy_policy text null,
  business_type character varying(50) null default 'retail',
  enable_stock_tracking boolean null default true,
  enable_inventory_alerts boolean null default true,
  enable_restock_management boolean null default true,
  enable_recipe_management boolean null default false,
  enable_service_booking boolean null default false,
  enable_menu_management boolean null default false,
  enable_ingredient_tracking boolean null default false,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint business_setting_pkey primary key (id),
  constraint business_setting_business_id_key unique (business_id),
  constraint business_setting_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint business_setting_type_check check (
    (
      (business_type)::text = any (
        array[
          'retail'::text,
          'restaurant'::text,
          'service'::text,
          'hybrid'::text,
          'pharmacy'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_business_setting_business_id on public.business_setting using btree (business_id) TABLESPACE pg_default;
create trigger update_business_setting_updated_at BEFORE
update on business_setting for EACH row
execute FUNCTION update_updated_at_column ();


-- Category
create table public.category (
  id uuid not null default gen_random_uuid (),
  business_id uuid not null,
  name character varying(255) not null,
  description text null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  color character varying null,
  constraint category_pkey primary key (id),
  constraint category_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_category_business_id on public.category using btree (business_id) TABLESPACE pg_default;

create trigger update_category_updated_at BEFORE
update on category for EACH row
execute FUNCTION update_updated_at_column ();


-- Country
create table public.country (
  id uuid not null default gen_random_uuid (),
  code character varying(2) not null,
  name character varying(100) not null,
  phone_code character varying(5) null,
  is_active boolean not null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint country_pkey primary key (id),
  constraint country_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_country_code on public.country using btree (code) TABLESPACE pg_default;
create index IF not exists idx_country_active on public.country using btree (is_active) TABLESPACE pg_default;

create trigger update_country_updated_at BEFORE
update on country for EACH row
execute FUNCTION update_updated_at_column ();


-- Currency
create table public.currency (
  id uuid not null default gen_random_uuid (),
  code character varying(3) not null,
  name character varying(50) not null,
  symbol character varying(5) not null,
  is_active boolean not null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  decimals smallint null default '2'::smallint,
  constraint currency_pkey primary key (id),
  constraint currency_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_currency_code on public.currency using btree (code) TABLESPACE pg_default;
create index IF not exists idx_currency_active on public.currency using btree (is_active) TABLESPACE pg_default;
create trigger update_currency_updated_at BEFORE
update on currency for EACH row
execute FUNCTION update_updated_at_column ();


-- Customer
create table public.customer (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  name character varying(255) not null,
  email character varying(255) null,
  phone character varying(50) null,
  address text null,
  total_purchases numeric(12, 2) null default 0,
  last_purchase_at timestamp without time zone null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint customer_pkey primary key (id),
  constraint customer_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_customer_store_id on public.customer using btree (store_id) TABLESPACE pg_default;

create trigger update_customer_updated_at BEFORE
update on customer for EACH row
execute FUNCTION update_updated_at_column ();


-- Language
create table public.language (
  id uuid not null default gen_random_uuid (),
  code character varying(5) not null,
  name character varying(50) not null,
  native_name character varying(50) not null,
  is_active boolean not null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  rtl boolean null default false,
  constraint language_pkey primary key (id),
  constraint language_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_language_code on public.language using btree (code) TABLESPACE pg_default;
create index IF not exists idx_language_active on public.language using btree (is_active) TABLESPACE pg_default;

create trigger update_language_updated_at BEFORE
update on language for EACH row
execute FUNCTION update_updated_at_column ();


-- Permission
-- NOTE: We use JSONB permissions stored directly in roles instead of a separate permissions table
-- This approach is cleaner because:
-- 1. Simpler schema (no joins needed)
-- 2. Atomic operations (role updates are single operations)
-- 3. No foreign key complexity
-- 4. Easier to manage and migrate
-- 5. Better performance (single table queries)
--
-- Permissions are stored in role.permissions as JSONB arrays like:
-- ["business.*", "store.*", "product.view", "sale.create"]


-- Platform Analytic
create table public.platform_analytic (
  id uuid not null default gen_random_uuid (),
  date date not null,
  new_users integer null default 0,
  active_users integer null default 0,
  new_businesses integer null default 0,
  active_businesses integer null default 0,
  total_transactions integer null default 0,
  total_revenue numeric(12, 2) null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint platform_analytic_pkey primary key (id),
  constraint platform_analytic_date_key unique (date)
) TABLESPACE pg_default;

create index IF not exists idx_platform_analytic_date on public.platform_analytic using btree (date) TABLESPACE pg_default;
create trigger update_platform_analytic_updated_at BEFORE
update on platform_analytic for EACH row
execute FUNCTION update_updated_at_column ();


-- Platform Health
create table public.platform_health (
  id uuid not null default gen_random_uuid (),
  metric_name character varying(100) not null,
  metric_value numeric(10, 4) not null,
  metric_unit character varying(50) null default ''::character varying,
  recorded_at timestamp without time zone null default now(),
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint platform_health_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_platform_health_metric on public.platform_health using btree (metric_name) TABLESPACE pg_default;


-- Platform Revenue
create table public.platform_revenue (
  id uuid not null default gen_random_uuid (),
  date date not null,
  revenue numeric(12, 2) not null default 0,
  subscription_revenue numeric(12, 2) not null default 0,
  transaction_fees numeric(12, 2) not null default 0,
  other_revenue numeric(12, 2) not null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint platform_revenue_pkey primary key (id),
  constraint platform_revenue_date_key unique (date)
) TABLESPACE pg_default;

create index IF not exists idx_platform_revenue_date on public.platform_revenue using btree (date) TABLESPACE pg_default;

create trigger update_platform_revenue_updated_at BEFORE
update on platform_revenue for EACH row
execute FUNCTION update_updated_at_column ();


-- Platform Setting
create table public.platform_setting (
  id uuid not null default gen_random_uuid (),
  platform_name character varying(255) null default 'SCIMS'::character varying,
  platform_version character varying(50) null default '1.0.0'::character varying,
  default_currency character varying(10) null default 'USD'::character varying,
  default_language character varying(10) null default 'en'::character varying,
  timezone character varying(100) null default 'UTC'::character varying,
  date_format character varying(50) null default 'MM/dd/yyyy'::character varying,
  time_format character varying(10) null default '12h'::character varying,
  demo_mode boolean null default false,
  maintenance_mode boolean null default false,
  maintenance_message text null default 'SCIMS is currently undergoing scheduled maintenance. We''ll be back online shortly. Thank you for your patience.'::text,
  allow_username_login boolean null default true,
  require_email_verification boolean null default false,
  session_timeout integer null default 480,
  max_login_attempts integer null default 5,
  supported_currencies jsonb null default '[{"code": "USD", "name": "US Dollar", "symbol": "$", "decimals": 2}, {"code": "EUR", "name": "Euro", "symbol": "€", "decimals": 2}, {"code": "GBP", "name": "British Pound", "symbol": "£", "decimals": 2}, {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "decimals": 0}, {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$", "decimals": 2}, {"code": "AUD", "name": "Australian Dollar", "symbol": "A$", "decimals": 2}, {"code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "decimals": 2}, {"code": "ZAR", "name": "South African Rand", "symbol": "R", "decimals": 2}, {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "decimals": 2}]'::jsonb,
  supported_languages jsonb null default '[{"rtl": false, "code": "en", "name": "English", "nativeName": "English"}, {"rtl": false, "code": "es", "name": "Spanish", "nativeName": "Español"}, {"rtl": false, "code": "fr", "name": "French", "nativeName": "Français"}, {"rtl": false, "code": "de", "name": "German", "nativeName": "Deutsch"}, {"rtl": true, "code": "ar", "name": "Arabic", "nativeName": "العربية"}, {"rtl": false, "code": "zh", "name": "Chinese", "nativeName": "中文"}, {"rtl": false, "code": "hi", "name": "Hindi", "nativeName": "हिन्दी"}]'::jsonb,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint platform_setting_pkey primary key (id)
) TABLESPACE pg_default;  

create trigger update_platform_setting_updated_at BEFORE
update on platform_setting for EACH row
execute FUNCTION update_updated_at_column ();


-- ========================================
-- MIGRATION SCRIPT FOR EXISTING BUSINESSES
-- ========================================

-- Update existing businesses to have 'retail' as default business_type
UPDATE business 
SET business_type = 'retail' 
WHERE business_type IS NULL;

-- Create business type settings for existing businesses
INSERT INTO public.business_setting (
  business_id, 
  business_type, 
  enable_stock_tracking,
  enable_inventory_alerts,
  enable_restock_management,
  enable_recipe_management,
  enable_service_booking,
  enable_menu_management,
  enable_ingredient_tracking
)
SELECT 
  id, 
  business_type, 
  CASE 
    WHEN business_type = 'retail' OR business_type = 'hybrid' OR business_type = 'pharmacy' THEN true
    ELSE false
  END as enable_stock_tracking,
  CASE 
    WHEN business_type = 'retail' OR business_type = 'hybrid' OR business_type = 'pharmacy' THEN true
    ELSE false
  END as enable_inventory_alerts,
  CASE 
    WHEN business_type = 'retail' OR business_type = 'hybrid' OR business_type = 'pharmacy' THEN true
    ELSE false
  END as enable_restock_management,
  CASE 
    WHEN business_type = 'restaurant' OR business_type = 'hybrid' THEN true
    ELSE false
  END as enable_recipe_management,
  CASE 
    WHEN business_type = 'service' OR business_type = 'hybrid' THEN true
    ELSE false
  END as enable_service_booking,
  CASE 
    WHEN business_type = 'restaurant' OR business_type = 'hybrid' THEN true
    ELSE false
  END as enable_menu_management,
  CASE 
    WHEN business_type = 'restaurant' OR business_type = 'hybrid' THEN true
    ELSE false
  END as enable_ingredient_tracking
FROM business 
WHERE id NOT IN (
  SELECT business_id FROM business_setting
);

-- Update existing business_setting records to include business_type if not set
UPDATE business_setting 
SET business_type = 'retail' 
WHERE business_type IS NULL;

-- Make business_type NOT NULL after migration
ALTER TABLE business_setting ALTER COLUMN business_type SET NOT NULL;

-- Update existing business_setting records to include business_type fields
ALTER TABLE business_setting 
ADD COLUMN IF NOT EXISTS business_type character varying(50) DEFAULT 'retail',
ADD COLUMN IF NOT EXISTS enable_stock_tracking boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_inventory_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_restock_management boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_recipe_management boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_service_booking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_menu_management boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_ingredient_tracking boolean DEFAULT false;

-- Update existing records with appropriate defaults based on business type
UPDATE business_setting 
SET 
  business_type = COALESCE(business_type, 'retail'),
  enable_stock_tracking = COALESCE(enable_stock_tracking, true),
  enable_inventory_alerts = COALESCE(enable_inventory_alerts, true),
  enable_restock_management = COALESCE(enable_restock_management, true),
  enable_recipe_management = COALESCE(enable_recipe_management, false),
  enable_service_booking = COALESCE(enable_service_booking, false),
  enable_menu_management = COALESCE(enable_menu_management, false),
  enable_ingredient_tracking = COALESCE(enable_ingredient_tracking, false)
WHERE business_type IS NULL;

-- Add check constraint for business_type
ALTER TABLE business_setting 
ADD CONSTRAINT IF NOT EXISTS business_setting_type_check 
CHECK (
  business_type = ANY(ARRAY['retail', 'restaurant', 'service', 'hybrid', 'pharmacy'])
);


-- Product
create table public.product (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  category_id uuid null,
  supplier_id uuid null,
  name character varying(255) not null,
  description text null,
  sku character varying(100) null,
  barcode character varying(100) null,
  price numeric(10, 2) not null default 0,
  cost numeric(10, 2) not null default 0,
  stock_quantity integer not null default 0,
  min_stock_level integer null default 0,
  max_stock_level integer null default 1000,
  brand_id uuid null,
  image_url text null,
  is_active boolean null default true,
  total_sold integer null default 0,
  total_revenue numeric(12, 2) null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  reorder_level smallint null default '0'::smallint,
  business_id uuid null,
  constraint product_pkey primary key (id),
  constraint product_brand_id_fkey foreign KEY (brand_id) references brand (id) on delete set null,
  constraint product_category_id_fkey foreign KEY (category_id) references category (id) on delete set null,
  constraint product_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint product_supplier_id_fkey foreign KEY (supplier_id) references supplier (id) on delete set null,
  constraint product_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_product_store_id on public.product using btree (store_id) TABLESPACE pg_default;
create index IF not exists idx_product_barcode on public.product using btree (barcode) TABLESPACE pg_default;
create index IF not exists idx_product_sku on public.product using btree (sku) TABLESPACE pg_default;
create index IF not exists idx_product_business_id on public.product using btree (business_id) TABLESPACE pg_default;

create trigger update_product_updated_at BEFORE
update on product for EACH row
execute FUNCTION update_updated_at_column ();


-- Restock Item
create table public.restock_item (
  id uuid not null default gen_random_uuid (),
  restock_order_id uuid not null,
  product_id uuid not null,
  quantity integer not null default 1,
  unit_cost numeric(10, 2) not null default 0,
  total_cost numeric(10, 2) not null default 0,
  received_quantity integer null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint restock_item_pkey primary key (id),
  constraint restock_item_product_id_fkey foreign KEY (product_id) references product (id) on delete RESTRICT,
  constraint restock_item_restock_order_id_fkey foreign KEY (restock_order_id) references restock_order (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_restock_item_restock_order_id on public.restock_item using btree (restock_order_id) TABLESPACE pg_default;
create index IF not exists idx_restock_item_product_id on public.restock_item using btree (product_id) TABLESPACE pg_default;

create trigger update_restock_item_updated_at BEFORE
update on restock_item for EACH row
execute FUNCTION update_updated_at_column ();


-- Restock Order
create table public.restock_order (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  supplier_id uuid not null,
  status character varying(20) not null default 'pending'::character varying,
  notes text null,
  created_by uuid not null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  total_amount numeric(10, 2) not null default 0,
  expected_delivery timestamp without time zone null,
  constraint restock_order_pkey primary key (id),
  constraint restock_order_created_by_fkey foreign KEY (created_by) references user (id) on delete RESTRICT,
  constraint restock_order_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint restock_order_supplier_id_fkey foreign KEY (supplier_id) references supplier (id) on delete set null,
  constraint restock_order_status_check check (
    (
      (status)::text = any (
        array[
          'pending'::text,
          'ordered'::text,
          'received'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_restock_order_store_id on public.restock_order using btree (store_id) TABLESPACE pg_default;
create index IF not exists idx_restock_order_status on public.restock_order using btree (status) TABLESPACE pg_default;
create index IF not exists idx_restock_order_supplier_id on public.restock_order using btree (supplier_id) TABLESPACE pg_default;
create index IF not exists idx_restock_order_created_at on public.restock_order using btree (created_at) TABLESPACE pg_default;

create trigger update_restock_order_updated_at BEFORE
update on restock_order for EACH row
execute FUNCTION update_updated_at_column ();


-- Role
create table public.role (
  id uuid not null default gen_random_uuid (),
  business_id uuid not null,
  name character varying(100) not null,
  description text null,
  permissions jsonb not null default '[]'::jsonb,
  is_system_role boolean not null default false,
  is_active boolean not null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint role_pkey primary key (id),
  constraint role_business_name_unique unique (business_id, name),
  constraint role_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_role_business_id on public.role using btree (business_id) TABLESPACE pg_default;
create index IF not exists idx_role_active on public.role using btree (is_active) TABLESPACE pg_default;

create trigger update_role_updated_at BEFORE
update on role for EACH row
execute FUNCTION update_updated_at_column ();


-- Platform Role (for system-wide role definitions)
create table public.platform_role (
  id uuid not null default gen_random_uuid(),
  name character varying(100) not null,
  description text null,
  permissions jsonb not null default '[]'::jsonb,
  is_system_role boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint platform_role_pkey primary key (id),
  constraint platform_role_name_key unique (name)
) TABLESPACE pg_default;

create index IF not exists idx_platform_role_active on public.platform_role using btree (is_active) TABLESPACE pg_default;
create index IF not exists idx_platform_role_display_order on public.platform_role using btree (display_order) TABLESPACE pg_default;

create trigger update_platform_role_updated_at BEFORE
update on platform_role for EACH row
execute FUNCTION update_updated_at_column ();

-- Insert initial platform roles
INSERT INTO public.platform_role (name, description, permissions, is_system_role, is_active, display_order) VALUES
('superadmin', 'Platform super administrator with full access', '["*"]', true, true, 1),
('business_admin', 'Business administrator with full business access',
 '["business.*", "store.*", "product.*", "user.*", "sale.*", "report.*", "setting.*"]', false, true, 2),
('store_admin', 'Store administrator with store-level access',
 '["store.view", "product.*", "sale.*", "user.view", "report.view"]', false, true, 3),
('cashier', 'Cashier with point-of-sale access',
 '["sale.create", "sale.view", "product.view", "customer.view", "customer.create"]', false, true, 4)
ON CONFLICT (name) DO NOTHING;


-- Sale
create table public.sale (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  cashier_id uuid not null,
  customer_id uuid null,
  receipt_number character varying(100) not null,
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  payment_method character varying(20) not null default 'cash',
  cash_received numeric(10, 2) null,
  change_given numeric(10, 2) null,
  status character varying(20) null default 'completed'::character varying,
  notes text null,
  transaction_date timestamp without time zone null default now(),
  created_at timestamp without time zone null default now(),
  payment_status character varying(50) null default 'completed'::character varying,
  receipt_printed boolean null default false,
  updated_at timestamp without time zone null default now(),
  discount_amount numeric(10, 2) not null default 0,
  constraint sale_pkey primary key (id),
  constraint sale_cashier_id_fkey foreign KEY (cashier_id) references user (id) on delete RESTRICT,
  constraint sale_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete set null,
  constraint sale_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint sale_status_check check (
    (
      (status)::text = any (
        array[
          'pending'::text,
          'completed'::text,
          'refunded'::text,
          'cancelled'::text
        ]
      )
    )
  ),
  constraint sale_payment_method_check check (
    (
      (payment_method)::text = any (
        array[
          'cash'::text,
          'card'::text,
          'mobile'::text,
          'other'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_sale_store_id on public.sale using btree (store_id) TABLESPACE pg_default;
create index IF not exists idx_sale_cashier_id on public.sale using btree (cashier_id) TABLESPACE pg_default;
create index IF not exists idx_sale_date on public.sale using btree (transaction_date) TABLESPACE pg_default;


create trigger update_sale_updated_at BEFORE
update on sale for EACH row
execute FUNCTION update_updated_at_column ();


-- Sale Item
create table public.sale_item (
  id uuid not null default gen_random_uuid (),
  sale_id uuid not null,
  product_id uuid not null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  created_at timestamp without time zone null default now(),
  discount_amount numeric(10, 2) not null default 0,
  constraint sale_item_pkey primary key (id),
  constraint sale_item_product_id_fkey foreign KEY (product_id) references product (id) on delete RESTRICT,
  constraint sale_item_sale_id_fkey foreign KEY (sale_id) references sale (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_sale_item_sale_id on public.sale_item using btree (sale_id) TABLESPACE pg_default;

create trigger update_sale_item_updated_at BEFORE
update on sale_item for EACH row
execute FUNCTION update_updated_at_column ();


-- Saved Cart
create table public.saved_cart (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  cashier_id uuid not null,
  customer_id uuid null,
  cart_name character varying(255) not null,
  cart_data jsonb not null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint saved_cart_pkey primary key (id),
  constraint saved_cart_cashier_id_fkey foreign KEY (cashier_id) references user (id) on delete CASCADE,
  constraint saved_cart_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete set null,
  constraint saved_cart_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_saved_cart_store_id on public.saved_cart using btree (store_id) TABLESPACE pg_default;
create index IF not exists idx_saved_cart_cashier_id on public.saved_cart using btree (cashier_id) TABLESPACE pg_default;

create trigger update_saved_cart_updated_at BEFORE
update on saved_cart for EACH row
execute FUNCTION update_updated_at_column ();


-- Store
create table public.store (
  id uuid not null default gen_random_uuid (),
  business_id uuid not null,
  name character varying(255) not null,
  address text null,
  city character varying(100) null,
  state character varying(100) null,
  postal_code character varying(20) null,
  phone character varying(50) null,
  email character varying(255) null,
  manager_name character varying(255) null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  currency_id uuid null,
  language_id uuid null,
  country_id uuid null,
  constraint store_pkey primary key (id),
  constraint store_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint store_country_id_fkey foreign KEY (country_id) references country (id) on delete set null,
  constraint store_currency_id_fkey foreign KEY (currency_id) references currency (id) on delete set null,
  constraint store_language_id_fkey foreign KEY (language_id) references language (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_store_business_id on public.store using btree (business_id) TABLESPACE pg_default;
create index IF not exists idx_store_currency_id on public.store using btree (currency_id) TABLESPACE pg_default;
create index IF not exists idx_store_language_id on public.store using btree (language_id) TABLESPACE pg_default;
create index IF not exists idx_store_country_id on public.store using btree (country_id) TABLESPACE pg_default;

create trigger update_store_updated_at BEFORE
update on store for EACH row
execute FUNCTION update_updated_at_column ();


-- Store Local Info
create table public.store_local_info (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  local_contact text null,
  store_hours text null,
  local_promotions text null,
  custom_receipt_message text null,
  local_return_policy text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint store_local_info_pkey primary key (id),
  constraint store_local_info_store_id_key unique (store_id),
  constraint store_local_info_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_store_local_info_store_id on public.store_local_info using btree (store_id) TABLESPACE pg_default;

create trigger update_store_local_info_updated_at BEFORE
update on store_local_info for EACH row
execute FUNCTION update_updated_at_column ();


-- Store Setting
create table public.store_setting (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  currency_id uuid null,
  language_id uuid null,
  tax_rate numeric(5, 2) null default 0.00,
  enable_tax boolean null default false,
  allow_returns boolean null default true,
  return_period_days integer null default 30,
  enable_sounds boolean null default true,
  logo_url text null,
  primary_color character varying(7) null default '#3B82F6'::character varying,
  secondary_color character varying(7) null default '#10B981'::character varying,
  accent_color character varying(7) null default '#F59E0B'::character varying,
  receipt_header text null,
  receipt_footer text null,
  return_policy text null,
  contact_person text null,
  store_hours text null,
  store_promotion_info text null,
  custom_receipt_message text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint store_setting_pkey primary key (id),
  constraint store_setting_store_id_key unique (store_id),
  constraint store_setting_currency_id_fkey foreign KEY (currency_id) references currency (id) on delete set null,
  constraint store_setting_language_id_fkey foreign KEY (language_id) references language (id) on delete set null,
  constraint store_setting_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_store_setting_store_id on public.store_setting using btree (store_id) TABLESPACE pg_default;
create index IF not exists idx_store_setting_currency_id on public.store_setting using btree (currency_id) TABLESPACE pg_default;
create index IF not exists idx_store_setting_language_id on public.store_setting using btree (language_id) TABLESPACE pg_default;

create trigger update_store_setting_updated_at BEFORE
update on store_setting for EACH row
execute FUNCTION update_updated_at_column ();


-- Subscription Distribution
create table public.subscription_distribution (
  id uuid not null default gen_random_uuid (),
  plan_name character varying(100) not null,
  subscriber_count integer not null default 0,
  revenue numeric(12, 2) not null default 0,
  recorded_date date null default CURRENT_DATE,
  created_at timestamp without time zone null default now(),
  constraint subscription_distribution_pkey primary key (id),
  constraint subscription_distribution_plan_name_recorded_date_key unique (plan_name, recorded_date)
) TABLESPACE pg_default;

create index IF not exists idx_subscription_distribution_date on public.subscription_distribution using btree (recorded_date) TABLESPACE pg_default;


-- Subscription Plan
create table public.subscription_plan (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  price_monthly numeric(10, 2) not null default 0,
  price_yearly numeric(10, 2) not null default 0,
  description text null,
  features jsonb null default '[]'::jsonb,
  max_stores integer null default 1,
  max_products integer null default 100,
  max_users integer null default 5,
  is_active boolean null default true,
  display_order integer null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  billing_cycle character varying null,
  is_popular boolean null default false,
  price character varying null,
  constraint subscription_plan_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_subscription_plan_active on public.subscription_plan using btree (is_active) TABLESPACE pg_default;


-- Supplier
create table public.supplier (
  id uuid not null default gen_random_uuid (),
  business_id uuid not null,
  name character varying(255) not null,
  contact_person character varying(255) null,
  email character varying(255) null,
  phone character varying(50) null,
  address text null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint supplier_pkey primary key (id),
  constraint supplier_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_supplier_business_id on public.supplier using btree (business_id) TABLESPACE pg_default;
create index IF not exists idx_supplier_active on public.supplier using btree (is_active) TABLESPACE pg_default;

create trigger update_supplier_updated_at BEFORE
update on supplier for EACH row
execute FUNCTION update_updated_at_column ();


-- User
create table public.user (
  id uuid not null default gen_random_uuid (),
  username character varying(50) not null,
  email character varying(255) null,
  password_hash character varying(255) not null,
  name character varying(255) not null,
  role character varying(20) not null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  is_demo boolean null default false,
  phone character varying null,
  last_login timestamp without time zone null,
  constraint user_pkey primary key (id),
  constraint user_email_key unique (email),
  constraint user_username_key unique (username),
  constraint user_role_check check (
    (
      (role)::text = any (
        array[
          'superadmin'::text,
          'business_admin'::text,
          'store_admin'::text,
          'cashier'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_username on public.user using btree (username) TABLESPACE pg_default;
create index IF not exists idx_user_email on public.user using btree (email) TABLESPACE pg_default;
create index IF not exists idx_user_role on public.user using btree (role) TABLESPACE pg_default;

create trigger update_user_updated_at BEFORE
update on user for EACH row
execute FUNCTION update_updated_at_column ();


-- User Business Role
create table public.user_business_role (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  business_id uuid null,
  store_id uuid null,
  created_at timestamp without time zone null default now(),
  constraint user_business_role_pkey primary key (id),
  constraint user_business_role_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint user_business_role_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint user_business_role_user_id_fkey foreign KEY (user_id) references user (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_business_role_business_id on public.user_business_role using btree (business_id) TABLESPACE pg_default;
create index IF not exists idx_user_business_role_store_id on public.user_business_role using btree (store_id) TABLESPACE pg_default;
create index IF not exists idx_user_business_role_user_id on public.user_business_role using btree (user_id) TABLESPACE pg_default;

create trigger update_user_business_role_updated_at BEFORE
update on user_business_role for EACH row
execute FUNCTION update_updated_at_column ();


-- User Role
create table public.user_role (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  role_id uuid not null,
  business_id uuid not null,
  store_id uuid null,
  assigned_at timestamp without time zone null default now(),
  is_active boolean not null default true,
  constraint user_role_pkey primary key (id),
  constraint user_role_user_business_unique unique (user_id, business_id),
  constraint user_role_role_id_fkey foreign KEY (role_id) references role (id) on delete CASCADE,
  constraint user_role_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint user_role_store_id_fkey foreign KEY (store_id) references store (id) on delete set null,
  constraint user_role_user_id_fkey foreign KEY (user_id) references user (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_role_user_id on public.user_role using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_user_role_role_id on public.user_role using btree (role_id) TABLESPACE pg_default;
create index IF not exists idx_user_role_business_id on public.user_role using btree (business_id) TABLESPACE pg_default;

create trigger update_user_role_updated_at BEFORE
update on user_role for EACH row
execute FUNCTION update_updated_at_column ();


-- User Role View
create view public.user_roles_view as
select
  ur.id,
  ur.user_id,
  ur.role_id,
  ur.business_id,
  ur.store_id,
  ur.assigned_at,
  ur.is_active,
  u.name as user_name,
  u.email as user_email,
  u.username as user_username,
  r.name as role_name,
  r.description as role_description,
  r.permissions as role_permissions,
  r.is_system_role,
  s.name as store_name
from
  user_role ur
  join user u on ur.user_id = u.id
  join role r on ur.role_id = r.id
  left join store s on ur.store_id = s.id;


-- ======================
-- RPC FUNCTIONS
-- ======================

-- Function to get user permissions for a business
CREATE OR REPLACE FUNCTION public.get_user_permissions(
  user_uuid uuid,
  business_uuid uuid
)
RETURNS TABLE(permission_id text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_record RECORD;
  permission_array jsonb;
  permission_item jsonb;
BEGIN
  -- Get all roles for the user in the business
  FOR role_record IN
    SELECT r.permissions
    FROM public.user_role ur
    JOIN public.role r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid 
      AND ur.business_id = business_uuid
      AND ur.is_active = true
      AND r.is_active = true
      AND r.permissions IS NOT NULL
      AND jsonb_array_length(r.permissions) > 0
  LOOP
    permission_array := role_record.permissions;
    
    -- Extract each permission from the JSONB array
    FOR i IN 0..jsonb_array_length(permission_array) - 1 LOOP
      permission_item := permission_array->i;
      permission_id := permission_item::text;
      RETURN NEXT;
    END LOOP;
  END LOOP;
  
  -- If no permissions found, return empty result
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;

-- Function to assign platform roles to a new business
CREATE OR REPLACE FUNCTION public.assign_platform_roles_to_business(business_uuid uuid)
RETURNS void AS $$
BEGIN
    -- Copy platform roles to this business's role table
    INSERT INTO public.role (business_id, name, description, permissions, is_system_role, is_active)
    SELECT
        business_uuid,
        name,
        description,
        permissions,
        is_system_role,
        is_active
    FROM public.platform_role
    WHERE name IN ('business_admin', 'store_admin', 'cashier')
        AND is_active = true
    ON CONFLICT (business_id, name) DO NOTHING;

    RAISE NOTICE 'Platform roles assigned to business %', business_uuid;
END;
$$ LANGUAGE plpgsql;

-- ======================
-- MENU MANAGEMENT SYSTEM
-- ======================

-- Menu categories table
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    bg_color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    action VARCHAR(100) NOT NULL, -- e.g., 'products', 'categories', 'pos'
    icon VARCHAR(100),
    color VARCHAR(50),
    bg_color VARCHAR(50),
    business_type VARCHAR(50) DEFAULT 'all', -- 'retail', 'restaurant', 'service', 'hybrid', 'pharmacy', 'all'
    requires_feature VARCHAR(100), -- e.g., 'stockTracking', 'menuManagement'
    user_roles TEXT[], -- Array of roles that can see this menu item
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business type menu configurations
CREATE TABLE IF NOT EXISTS public.business_type_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_type VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    bg_color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default menu categories
INSERT INTO public.menu_categories (name, description, icon, color, bg_color, sort_order) VALUES
('overview', 'Main dashboard overview features', 'LayoutDashboard', 'text-blue-600', 'bg-blue-50', 1),
('menu', 'Main navigation menu items', 'Menu', 'text-gray-600', 'bg-gray-50', 2)
ON CONFLICT (name) DO NOTHING;

-- Insert default business types
INSERT INTO public.business_type_menus (business_type, name, description, icon, color, bg_color) VALUES
('retail', 'Retail Store', 'Traditional retail business with inventory management', '🛍️', 'text-blue-600', 'bg-blue-50'),
('restaurant', 'Restaurant', 'Restaurant business with menu and recipe management', '🍽️', 'text-green-600', 'bg-green-50'),
('service', 'Service Business', 'Service-based business with appointment booking', '🔧', 'text-purple-600', 'bg-purple-50'),
('hybrid', 'Hybrid Business', 'Combines multiple business types', '🔄', 'text-orange-600', 'bg-orange-50'),
('pharmacy', 'Pharmacy', 'Pharmacy with specialized inventory management', '💊', 'text-red-600', 'bg-red-50')
ON CONFLICT (business_type) DO NOTHING;

-- Insert default menu items for retail business
INSERT INTO public.menu_items (category_id, title, description, action, icon, color, bg_color, business_type, requires_feature, user_roles, sort_order) VALUES
-- Overview items for retail
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Point of Sale', 'Process sales and manage transactions', 'pos', 'ShoppingCart', 'text-blue-600', 'bg-blue-50', 'retail', NULL, ARRAY['business_admin', 'store_admin', 'cashier'], 1),
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Sales Report', 'View sales reports and analytics', 'sales-report', 'BarChart3', 'text-red-600', 'bg-red-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 2),
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Store Settings', 'Configure store preferences', 'store-settings', 'Settings', 'text-gray-600', 'bg-gray-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 3),
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Business Settings', 'Configure business preferences', 'business-settings', 'Building2', 'text-gray-600', 'bg-gray-50', 'retail', NULL, ARRAY['business_admin'], 4),

-- Menu items for retail
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Products', 'Manage your inventory and products', 'products', 'Package', 'text-green-600', 'bg-green-50', 'retail', 'stockTracking', ARRAY['business_admin', 'store_admin'], 1),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Categories', 'Organize products into categories', 'categories', 'FolderOpen', 'text-purple-600', 'bg-purple-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 2),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Brands', 'Manage product brands', 'brands', 'Tag', 'text-orange-600', 'bg-orange-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 3),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Restock', 'Manage replenishment and restock orders', 'restock', 'Truck', 'text-amber-600', 'bg-amber-50', 'retail', 'restockManagement', ARRAY['business_admin', 'store_admin'], 4),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Suppliers', 'Manage your suppliers and vendors', 'suppliers', 'Users', 'text-indigo-600', 'bg-indigo-50', 'retail', 'stockTracking', ARRAY['business_admin', 'store_admin'], 5),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Customers', 'Manage customer information and history', 'customers', 'UserPlus', 'text-pink-600', 'bg-pink-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 6),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Cashiers', 'Manage cashiers and staff', 'cashiers', 'UserCheck', 'text-yellow-600', 'bg-yellow-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 7),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Staff', 'Manage all staff members and roles', 'staff', 'Users', 'text-indigo-600', 'bg-indigo-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 8),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Roles & Permissions', 'Manage staff roles and access permissions', 'roles', 'Shield', 'text-purple-600', 'bg-purple-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 9),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Reports', 'View comprehensive business reports', 'reports', 'FileText', 'text-red-600', 'bg-red-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 10),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Activity Logs', 'View system activity and audit logs', 'activity-logs', 'Activity', 'text-teal-600', 'bg-teal-50', 'retail', NULL, ARRAY['business_admin', 'store_admin'], 11)
ON CONFLICT (id) DO NOTHING;

-- Insert default menu items for restaurant business
INSERT INTO public.menu_items (category_id, title, description, action, icon, color, bg_color, business_type, requires_feature, user_roles, sort_order) VALUES
-- Overview items for restaurant
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Point of Sale', 'Process sales and manage transactions', 'pos', 'ShoppingCart', 'text-blue-600', 'bg-blue-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin', 'cashier'], 1),
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Sales Report', 'View sales reports and analytics', 'sales-report', 'BarChart3', 'text-red-600', 'bg-red-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 2),
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Store Settings', 'Configure store preferences', 'store-settings', 'Settings', 'text-gray-600', 'bg-gray-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 3),

-- Menu items for restaurant
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Products', 'Manage your inventory and products', 'products', 'Package', 'text-green-600', 'bg-green-50', 'restaurant', 'stockTracking', ARRAY['business_admin', 'store_admin'], 1),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Menu Management', 'Manage restaurant menu items', 'menu-management', 'Menu', 'text-emerald-600', 'bg-emerald-50', 'restaurant', 'menuManagement', ARRAY['business_admin', 'store_admin'], 2),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Recipe Management', 'Manage recipes and ingredients', 'recipe-management', 'ChefHat', 'text-cyan-600', 'bg-cyan-50', 'restaurant', 'recipeManagement', ARRAY['business_admin', 'store_admin'], 3),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Categories', 'Organize products into categories', 'categories', 'FolderOpen', 'text-purple-600', 'bg-purple-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 4),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Brands', 'Manage product brands', 'brands', 'Tag', 'text-orange-600', 'bg-orange-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 5),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Customers', 'Manage customer information and history', 'customers', 'UserPlus', 'text-pink-600', 'bg-pink-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 6),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Cashiers', 'Manage cashiers and staff', 'cashiers', 'UserCheck', 'text-yellow-600', 'bg-yellow-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 7),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Staff', 'Manage all staff members and roles', 'staff', 'Users', 'text-indigo-600', 'bg-indigo-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 8),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Reports', 'View detailed analytics', 'reports', 'FileText', 'text-orange-600', 'bg-orange-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 9),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Activity Logs', 'View system activity', 'activity-logs', 'Activity', 'text-yellow-600', 'bg-yellow-50', 'restaurant', NULL, ARRAY['business_admin', 'store_admin'], 10)
ON CONFLICT (id) DO NOTHING;

-- Insert default menu items for service business
INSERT INTO public.menu_items (category_id, title, description, action, icon, color, bg_color, business_type, requires_feature, user_roles, sort_order) VALUES
-- Overview items for service
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Point of Sale', 'Process sales and manage transactions', 'pos', 'ShoppingCart', 'text-blue-600', 'bg-blue-50', 'service', NULL, ARRAY['business_admin', 'store_admin', 'cashier'], 1),
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Sales Report', 'View sales reports and analytics', 'sales-report', 'BarChart3', 'text-red-600', 'bg-red-50', 'service', NULL, ARRAY['business_admin', 'store_admin'], 2),
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Store Settings', 'Configure store preferences', 'store-settings', 'Settings', 'text-gray-600', 'bg-gray-50', 'service', NULL, ARRAY['business_admin', 'store_admin'], 3),

-- Menu items for service
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Service Booking', 'Manage service appointments', 'service-booking', 'Calendar', 'text-purple-600', 'bg-purple-50', 'service', 'serviceBooking', ARRAY['business_admin', 'store_admin'], 1),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Products', 'Manage your service offerings', 'products', 'Package', 'text-green-600', 'bg-green-50', 'service', 'stockTracking', ARRAY['business_admin', 'store_admin'], 2),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Categories', 'Organize services into categories', 'categories', 'FolderOpen', 'text-purple-600', 'bg-purple-50', 'service', NULL, ARRAY['business_admin', 'store_admin'], 3),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Customers', 'Manage customer information and history', 'customers', 'UserPlus', 'text-pink-600', 'bg-pink-50', 'service', NULL, ARRAY['business_admin', 'store_admin'], 4),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Staff', 'Manage all staff members and roles', 'staff', 'Users', 'text-indigo-600', 'bg-indigo-50', 'service', NULL, ARRAY['business_admin', 'store_admin'], 5),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Reports', 'View service analytics', 'reports', 'FileText', 'text-orange-600', 'bg-orange-50', 'service', NULL, ARRAY['business_admin', 'store_admin'], 6),
((SELECT id FROM public.menu_categories WHERE name = 'menu'), 'Activity Logs', 'View system activity', 'activity-logs', 'Activity', 'text-yellow-600', 'bg-yellow-50', 'service', NULL, ARRAY['business_admin', 'store_admin'], 7)
ON CONFLICT (id) DO NOTHING;

-- Insert cashier menu items (same for all business types)
INSERT INTO public.menu_items (category_id, title, description, action, icon, color, bg_color, business_type, requires_feature, user_roles, sort_order) VALUES
((SELECT id FROM public.menu_categories WHERE name = 'overview'), 'Point of Sale', 'Process sales and manage transactions', 'pos', 'ShoppingCart', 'text-blue-600', 'bg-blue-50', 'all', NULL, ARRAY['cashier'], 1)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_business_type ON public.menu_items(business_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_user_roles ON public.menu_items USING GIN(user_roles);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON public.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON public.menu_items(sort_order);

-- Create triggers for updated_at
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_type_menus_updated_at BEFORE UPDATE ON public.business_type_menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================
-- UTILITY FUNCTIONS
-- ======================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

