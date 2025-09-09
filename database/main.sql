-- ======================
-- ACTIVITY LOG
-- ======================
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
  constraint activity_log_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint activity_log_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint activity_log_user_id_fkey foreign KEY (user_id) references "user" (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_activity_log_user_id on public.activity_log using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_activity_log_created_at on public.activity_log using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_activity_log_business_id on public.activity_log using btree (business_id) TABLESPACE pg_default;

-- ======================
-- BRAND
-- ======================
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


-- ======================
-- BUSINESS
-- ======================

create table public.business (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  description text null,
  industry character varying(100) null,
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
  business_type character varying null default 'retail'::character varying,
  username character varying(100) null,
  slug character varying(100) null,
  constraint business_pkey primary key (id),
  constraint business_country_id_fkey foreign KEY (country_id) references country (id) on delete set null,
  constraint business_currency_id_fkey foreign KEY (currency_id) references currency (id) on delete set null,
  constraint business_language_id_fkey foreign KEY (language_id) references language (id) on delete set null,
  constraint business_subscription_plan_id_fkey foreign KEY (subscription_plan_id) references subscription_plan (id) on delete set null,
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
  )
) TABLESPACE pg_default;

create unique INDEX IF not exists idx_business_username on public.business using btree (username) TABLESPACE pg_default;

create unique INDEX IF not exists idx_business_slug on public.business using btree (slug) TABLESPACE pg_default;

create index IF not exists idx_business_currency_id on public.business using btree (currency_id) TABLESPACE pg_default;

create index IF not exists idx_business_language_id on public.business using btree (language_id) TABLESPACE pg_default;

create index IF not exists idx_business_country_id on public.business using btree (country_id) TABLESPACE pg_default;

create trigger update_business_updated_at BEFORE
update on business for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- BUSINESS SETTING
-- ======================
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
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  business_type character varying(50) null default 'retail'::character varying,
  enable_stock_tracking boolean null default true,
  enable_inventory_alerts boolean null default true,
  enable_restock_management boolean null default true,
  enable_recipe_management boolean null default false,
  enable_service_booking boolean null default false,
  enable_menu_management boolean null default false,
  enable_ingredient_tracking boolean null default false,
  enable_public_store boolean null default false,
  store_theme character varying(50) null default 'default'::character varying,
  store_banner_url text null,
  store_description text null,
  whatsapp_phone character varying(50) null,
  whatsapp_message_template text null default 'New order received from {customer_name}!\n\nOrder Details:\n{order_items}\n\nTotal: {total_amount}\n\nCustomer: {customer_name}\nPhone: {customer_phone}\nAddress: {customer_address}'::text,
  constraint business_setting_pkey primary key (id),
  constraint business_setting_business_id_key unique (business_id),
  constraint business_setting_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_business_setting_business_id on public.business_setting using btree (business_id) TABLESPACE pg_default;

create trigger update_business_setting_updated_at BEFORE
update on business_setting for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- BUSINESS TYPE MENUS
-- ======================

create table public.business_type_menus (
  id uuid not null default gen_random_uuid (),
  business_type character varying(50) not null,
  name character varying(100) not null,
  description text null,
  icon character varying(100) null,
  color character varying(50) null,
  bg_color character varying(50) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint business_type_menus_pkey primary key (id),
  constraint business_type_menus_business_type_key unique (business_type)
) TABLESPACE pg_default;

create trigger update_business_type_menus_updated_at BEFORE
update on business_type_menus for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- CATEGORY
-- ======================

create table public.category (
  id uuid not null default gen_random_uuid (),
  business_id uuid not null,
  name character varying(255) not null,
  description text null,
  is_active boolean null default true,
  color character varying null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint category_pkey primary key (id),
  constraint category_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_category_business_id on public.category using btree (business_id) TABLESPACE pg_default;

create trigger update_category_updated_at BEFORE
update on category for EACH row
execute FUNCTION update_updated_at_column ();

-- ======================
-- COUNTRY
-- ======================

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



-- ======================
-- CURRENCY
-- ======================

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



-- ======================
-- CUSTOMER
-- ======================

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



-- ======================
-- LANGUAGE
-- ======================

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



-- ======================
-- MENU CATEGORIES
-- ======================

create table public.menu_categories (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  description text null,
  icon character varying(100) null,
  color character varying(50) null,
  bg_color character varying(50) null,
  sort_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint menu_categories_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_menu_categories_updated_at BEFORE
update on menu_categories for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- MENU ITEMS
-- ======================

create table public.menu_items (
  id uuid not null default gen_random_uuid (),
  category_id uuid null,
  title character varying(200) not null,
  description text null,
  action character varying(100) not null,
  icon character varying(100) null,
  color character varying(50) null,
  bg_color character varying(50) null,
  business_type character varying(50) null default 'all'::character varying,
  requires_feature character varying(100) null,
  user_roles text[] null,
  is_active boolean null default true,
  sort_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint menu_items_pkey primary key (id),
  constraint menu_items_category_id_fkey foreign KEY (category_id) references menu_categories (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_menu_items_business_type on public.menu_items using btree (business_type) TABLESPACE pg_default;

create index IF not exists idx_menu_items_user_roles on public.menu_items using gin (user_roles) TABLESPACE pg_default;

create index IF not exists idx_menu_items_category_id on public.menu_items using btree (category_id) TABLESPACE pg_default;

create index IF not exists idx_menu_items_is_active on public.menu_items using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_menu_items_sort_order on public.menu_items using btree (sort_order) TABLESPACE pg_default;

create trigger update_menu_items_updated_at BEFORE
update on menu_items for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- PENDING RETURNS
-- ======================

create view public.pending_returns as
select
  so.id as supply_order_id,
  so.supply_number,
  c.name as customer_name,
  c.phone as customer_phone,
  so.supply_date,
  so.expected_return_date,
  count(soi.id) as items_pending_return,
  sum(
    soi.quantity_supplied - soi.quantity_returned - soi.quantity_accepted
  ) as total_quantity_pending
from
  supply_order so
  join customer c on so.customer_id = c.id
  join supply_order_item soi on so.id = soi.supply_order_id
where
  (
    so.status::text = any (
      array[
        'supplied'::character varying,
        'partially_returned'::character varying
      ]::text[]
    )
  )
  and (
    soi.quantity_supplied - soi.quantity_returned - soi.quantity_accepted
  ) > 0
group by
  so.id,
  so.supply_number,
  c.name,
  c.phone,
  so.supply_date,
  so.expected_return_date;


-- ======================
-- PLATFORM ANALYTIC
-- ======================
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


-- ======================
-- PLATFORM REVENUE
-- ======================

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


-- ======================
-- PLATFORM ROLE
-- ======================

create table public.platform_role (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  description text null,
  permissions jsonb not null default '[]'::jsonb,
  is_system_role boolean null default false,
  is_active boolean null default true,
  display_order integer null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint platform_role_pkey primary key (id),
  constraint platform_role_name_key unique (name)
) TABLESPACE pg_default;

create index IF not exists idx_platform_role_active on public.platform_role using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_platform_role_display_order on public.platform_role using btree (display_order) TABLESPACE pg_default;


-- ======================
-- PLATFORM SETTING
-- ======================

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
  system_status character varying(20) null default 'healthy'::character varying,
  cpu_usage numeric(5, 2) null default 0.00,
  memory_usage numeric(5, 2) null default 0.00,
  disk_usage numeric(5, 2) null default 0.00,
  active_connections integer null default 0,
  last_health_check timestamp without time zone null default now(),
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint platform_setting_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_platform_setting_updated_at BEFORE
update on platform_setting for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- PRODUCT
-- ======================

create table public.product (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  category_id uuid null,
  supplier_id uuid null,
  business_id uuid null,
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
  is_public boolean null default false,
  public_description text null,
  public_images jsonb null default '[]'::jsonb,
  constraint product_pkey primary key (id),
  constraint product_brand_id_fkey foreign KEY (brand_id) references brand (id) on delete set null,
  constraint product_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint product_category_id_fkey foreign KEY (category_id) references category (id) on delete set null,
  constraint product_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint product_supplier_id_fkey foreign KEY (supplier_id) references supplier (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_product_is_public on public.product using btree (is_public) TABLESPACE pg_default;

create index IF not exists idx_product_store_id on public.product using btree (store_id) TABLESPACE pg_default;

create index IF not exists idx_product_barcode on public.product using btree (barcode) TABLESPACE pg_default;

create index IF not exists idx_product_sku on public.product using btree (sku) TABLESPACE pg_default;

create index IF not exists idx_product_business_id on public.product using btree (business_id) TABLESPACE pg_default;

create trigger update_product_updated_at BEFORE
update on product for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- PURCHASE ORDER
-- ======================

create table public.public_order (
  id uuid not null default gen_random_uuid (),
  business_id uuid not null,
  store_id uuid not null,
  customer_name character varying(255) not null,
  customer_phone character varying(50) not null,
  customer_email character varying(255) null,
  customer_address text null,
  order_items jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  status character varying(20) not null default 'pending'::character varying,
  notes text null,
  whatsapp_sent boolean null default false,
  whatsapp_message_id character varying(255) null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint public_order_pkey primary key (id),
  constraint public_order_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint public_order_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint public_order_status_check check (
    (
      (status)::text = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'processing'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_public_order_business_id on public.public_order using btree (business_id) TABLESPACE pg_default;

create index IF not exists idx_public_order_store_id on public.public_order using btree (store_id) TABLESPACE pg_default;

create index IF not exists idx_public_order_status on public.public_order using btree (status) TABLESPACE pg_default;

create index IF not exists idx_public_order_created_at on public.public_order using btree (created_at) TABLESPACE pg_default;

create trigger update_public_order_updated_at BEFORE
update on public_order for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- RESTOCK ITEM
-- ======================

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

create index IF not exists idx_restock_item_total on public.restock_item using btree (total_cost) TABLESPACE pg_default;

create trigger update_restock_item_updated_at BEFORE
update on restock_item for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- RESTOCK ORDER
-- ======================

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
  constraint restock_order_created_by_fkey foreign KEY (created_by) references "user" (id) on delete RESTRICT,
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

create index IF not exists idx_restock_order_total on public.restock_order using btree (total_amount) TABLESPACE pg_default;

create trigger update_restock_order_updated_at BEFORE
update on restock_order for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- ROLE
-- ======================

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


-- ======================
-- SALE
-- ======================

create table public.sale (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  cashier_id uuid not null,
  customer_id uuid null,
  receipt_number character varying(100) not null,
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  payment_method character varying(20) not null,
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
  constraint sale_cashier_id_fkey foreign KEY (cashier_id) references "user" (id) on delete RESTRICT,
  constraint sale_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete set null,
  constraint sale_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint sale_payment_method_check check (
    (
      (payment_method)::text = any (
        (
          array[
            'cash'::character varying,
            'card'::character varying,
            'mobile'::character varying,
            'other'::character varying
          ]
        )::text[]
      )
    )
  ),
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
  )
) TABLESPACE pg_default;

create index IF not exists idx_sale_store_id on public.sale using btree (store_id) TABLESPACE pg_default;

create index IF not exists idx_sale_cashier_id on public.sale using btree (cashier_id) TABLESPACE pg_default;

create index IF not exists idx_sale_date on public.sale using btree (transaction_date) TABLESPACE pg_default;

create index IF not exists idx_sale_payment_method on public.sale using btree (payment_method) TABLESPACE pg_default;

create trigger update_sale_updated_at BEFORE
update on sale for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- SALE ITEM
-- ======================

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

create index IF not exists idx_sale_item_discount on public.sale_item using btree (discount_amount) TABLESPACE pg_default;

create trigger update_sale_item_updated_at BEFORE
update on sale_item for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- SAVED CART
-- ======================

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
  constraint saved_cart_cashier_id_fkey foreign KEY (cashier_id) references "user" (id) on delete CASCADE,
  constraint saved_cart_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete set null,
  constraint saved_cart_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_saved_cart_store_id on public.saved_cart using btree (store_id) TABLESPACE pg_default;

create index IF not exists idx_saved_cart_cashier_id on public.saved_cart using btree (cashier_id) TABLESPACE pg_default;

create trigger update_saved_cart_updated_at BEFORE
update on saved_cart for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- STORE
-- ======================

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


-- ======================
-- STORE SETTING
-- ======================

create table public.store_setting (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
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
  constraint store_setting_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_store_setting_store_id on public.store_setting using btree (store_id) TABLESPACE pg_default;

create trigger update_store_setting_updated_at BEFORE
update on store_setting for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- SUBSCRIPTION DISTRIBUTION
-- ======================
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


-- ======================
-- SUBSCRIPTION PLAN
-- ======================

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


-- ======================
-- SUPPLIER
-- ======================

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



-- ======================
-- SUPPLY ORDER
-- ======================

create table public.supply_order (
  id uuid not null default gen_random_uuid (),
  store_id uuid not null,
  customer_id uuid not null,
  cashier_id uuid not null,
  supply_number character varying(50) not null,
  status character varying(20) not null default 'supplied'::character varying,
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  notes text null,
  supply_date timestamp without time zone null default now(),
  expected_return_date timestamp without time zone null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint supply_order_pkey primary key (id),
  constraint supply_order_supply_number_key unique (supply_number),
  constraint supply_order_cashier_id_fkey foreign KEY (cashier_id) references "user" (id) on delete RESTRICT,
  constraint supply_order_customer_id_fkey foreign KEY (customer_id) references customer (id) on delete RESTRICT,
  constraint supply_order_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint supply_order_status_check check (
    (
      (status)::text = any (
        (
          array[
            'supplied'::character varying,
            'partially_returned'::character varying,
            'fully_returned'::character varying,
            'completed'::character varying,
            'cancelled'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_supply_order_store_id on public.supply_order using btree (store_id) TABLESPACE pg_default;

create index IF not exists idx_supply_order_customer_id on public.supply_order using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_supply_order_status on public.supply_order using btree (status) TABLESPACE pg_default;

create index IF not exists idx_supply_order_supply_date on public.supply_order using btree (supply_date) TABLESPACE pg_default;

create index IF not exists idx_supply_order_supply_number on public.supply_order using btree (supply_number) TABLESPACE pg_default;

create trigger update_supply_order_updated_at BEFORE
update on supply_order for EACH row
execute FUNCTION update_updated_at_column ();

-- ======================
-- SUPPLY ORDER ITEM
-- ======================

create table public.supply_order_item (
  id uuid not null default gen_random_uuid (),
  supply_order_id uuid not null,
  product_id uuid not null,
  quantity_supplied integer not null default 0,
  quantity_returned integer not null default 0,
  quantity_accepted integer not null default 0,
  unit_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null default 0,
  return_reason text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint supply_order_item_pkey primary key (id),
  constraint supply_order_item_product_id_fkey foreign KEY (product_id) references product (id) on delete RESTRICT,
  constraint supply_order_item_supply_order_id_fkey foreign KEY (supply_order_id) references supply_order (id) on delete CASCADE,
  constraint supply_order_item_quantity_check check (
    (
      (quantity_supplied >= 0)
      and (quantity_returned >= 0)
      and (quantity_accepted >= 0)
    )
  ),
  constraint supply_order_item_quantity_logic_check check (
    (
      (quantity_returned + quantity_accepted) <= quantity_supplied
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_supply_order_item_supply_order_id on public.supply_order_item using btree (supply_order_id) TABLESPACE pg_default;

create index IF not exists idx_supply_order_item_product_id on public.supply_order_item using btree (product_id) TABLESPACE pg_default;

create trigger trigger_reduce_stock_on_supply
after INSERT on supply_order_item for EACH row
execute FUNCTION reduce_stock_on_supply ();

create trigger trigger_update_supply_order_status_item
after INSERT
or
update on supply_order_item for EACH row
execute FUNCTION update_supply_order_status ();

create trigger update_supply_order_item_updated_at BEFORE
update on supply_order_item for EACH row
execute FUNCTION update_updated_at_column ();

-- ======================
-- SUPPLY ORDER ITEM DETAIL
-- ======================


create view public.supply_order_items_detail as
select
  soi.id,
  soi.supply_order_id,
  so.supply_number,
  p.name as product_name,
  p.sku,
  p.barcode,
  soi.quantity_supplied,
  soi.quantity_returned,
  soi.quantity_accepted,
  soi.unit_price,
  soi.total_price,
  soi.return_reason,
  soi.quantity_supplied - soi.quantity_returned - soi.quantity_accepted as quantity_pending
from
  supply_order_item soi
  join supply_order so on soi.supply_order_id = so.id
  join product p on soi.product_id = p.id;

-- ======================
-- SUPPLY ORDER SUMMARY
-- ======================

create view public.supply_order_summary as
select
  so.id,
  so.supply_number,
  so.status,
  so.supply_date,
  so.expected_return_date,
  so.total_amount,
  c.name as customer_name,
  c.phone as customer_phone,
  u.name as cashier_name,
  s.name as store_name,
  count(soi.id) as total_items,
  sum(soi.quantity_supplied) as total_quantity_supplied,
  sum(soi.quantity_returned) as total_quantity_returned,
  sum(soi.quantity_accepted) as total_quantity_accepted
from
  supply_order so
  join customer c on so.customer_id = c.id
  join "user" u on so.cashier_id = u.id
  join store s on so.store_id = s.id
  left join supply_order_item soi on so.id = soi.supply_order_id
group by
  so.id,
  so.supply_number,
  so.status,
  so.supply_date,
  so.expected_return_date,
  so.total_amount,
  c.name,
  c.phone,
  u.name,
  s.name;


-- ======================
-- SUPPLY PAYMENT
-- ======================

create table public.supply_payment (
  id uuid not null default gen_random_uuid (),
  supply_order_id uuid not null,
  payment_number character varying(50) not null,
  payment_method character varying(20) not null default 'cash'::character varying,
  amount_paid numeric(10, 2) not null default 0,
  payment_date timestamp without time zone null default now(),
  processed_by uuid null,
  notes text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint supply_payment_pkey primary key (id),
  constraint supply_payment_payment_number_key unique (payment_number),
  constraint supply_payment_processed_by_fkey foreign KEY (processed_by) references "user" (id) on delete set null,
  constraint supply_payment_supply_order_id_fkey foreign KEY (supply_order_id) references supply_order (id) on delete CASCADE,
  constraint supply_payment_payment_method_check check (
    (
      (payment_method)::text = any (
        (
          array[
            'cash'::character varying,
            'card'::character varying,
            'mobile'::character varying,
            'other'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_supply_payment_supply_order_id on public.supply_payment using btree (supply_order_id) TABLESPACE pg_default;

create index IF not exists idx_supply_payment_payment_date on public.supply_payment using btree (payment_date) TABLESPACE pg_default;

create trigger update_supply_payment_updated_at BEFORE
update on supply_payment for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- SUPPLY RETURN
-- ======================


create table public.supply_return (
  id uuid not null default gen_random_uuid (),
  supply_order_id uuid not null,
  return_number character varying(50) not null,
  status character varying(20) not null default 'pending'::character varying,
  total_returned_amount numeric(10, 2) not null default 0,
  notes text null,
  return_date timestamp without time zone null default now(),
  processed_by uuid null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint supply_return_pkey primary key (id),
  constraint supply_return_return_number_key unique (return_number),
  constraint supply_return_processed_by_fkey foreign KEY (processed_by) references "user" (id) on delete set null,
  constraint supply_return_supply_order_id_fkey foreign KEY (supply_order_id) references supply_order (id) on delete CASCADE,
  constraint supply_return_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'processed'::character varying,
            'cancelled'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_supply_return_supply_order_id on public.supply_return using btree (supply_order_id) TABLESPACE pg_default;

create index IF not exists idx_supply_return_status on public.supply_return using btree (status) TABLESPACE pg_default;

create index IF not exists idx_supply_return_return_date on public.supply_return using btree (return_date) TABLESPACE pg_default;

create trigger update_supply_return_updated_at BEFORE
update on supply_return for EACH row
execute FUNCTION update_updated_at_column ();


-- ======================
-- SUPPLY RETURN ITEM
-- ======================

create table public.supply_return_item (
  id uuid not null default gen_random_uuid (),
  supply_return_id uuid not null,
  supply_order_item_id uuid not null,
  quantity_returned integer not null default 0,
  return_reason text null,
  condition character varying(20) null default 'good'::character varying,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint supply_return_item_pkey primary key (id),
  constraint supply_return_item_supply_order_item_id_fkey foreign KEY (supply_order_item_id) references supply_order_item (id) on delete CASCADE,
  constraint supply_return_item_supply_return_id_fkey foreign KEY (supply_return_id) references supply_return (id) on delete CASCADE,
  constraint supply_return_item_condition_check check (
    (
      (condition)::text = any (
        (
          array[
            'good'::character varying,
            'damaged'::character varying,
            'defective'::character varying,
            'expired'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_supply_return_item_supply_return_id on public.supply_return_item using btree (supply_return_id) TABLESPACE pg_default;

create index IF not exists idx_supply_return_item_supply_order_item_id on public.supply_return_item using btree (supply_order_item_id) TABLESPACE pg_default;

create trigger trigger_restore_stock_on_return
after INSERT on supply_return_item for EACH row
execute FUNCTION restore_stock_on_return ();

create trigger trigger_update_supply_order_status_return
after INSERT
or
update on supply_return_item for EACH row
execute FUNCTION update_supply_order_status ();

create trigger update_supply_return_item_updated_at BEFORE
update on supply_return_item for EACH row
execute FUNCTION update_updated_at_column ();

-- ======================
-- USER
-- ======================

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
  email_verified boolean null default false,
  email_verification_token character varying(255) null,
  email_verification_expires_at timestamp without time zone null,
  password_reset_token character varying(255) null,
  password_reset_expires_at timestamp without time zone null,
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

create index IF not exists idx_user_username on public."user" using btree (username) TABLESPACE pg_default;

create index IF not exists idx_user_email on public."user" using btree (email) TABLESPACE pg_default;

create index IF not exists idx_user_role on public."user" using btree (role) TABLESPACE pg_default;

create index IF not exists idx_user_email_verification_token on public."user" using btree (email_verification_token) TABLESPACE pg_default;

create index IF not exists idx_user_password_reset_token on public."user" using btree (password_reset_token) TABLESPACE pg_default;

create index IF not exists idx_user_email_verified on public."user" using btree (email_verified) TABLESPACE pg_default;

create trigger update_user_updated_at BEFORE
update on "user" for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- USER BUSINESS ROLE
-- ======================
create table public.user_business_role (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  business_id uuid null,
  store_id uuid null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp with time zone null,
  constraint user_business_role_pkey primary key (id),
  constraint user_business_role_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint user_business_role_store_id_fkey foreign KEY (store_id) references store (id) on delete CASCADE,
  constraint user_business_role_user_id_fkey foreign KEY (user_id) references "user" (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_business_role_business_id on public.user_business_role using btree (business_id) TABLESPACE pg_default;

create index IF not exists idx_user_business_role_store_id on public.user_business_role using btree (store_id) TABLESPACE pg_default;

create index IF not exists idx_user_business_role_user_id on public.user_business_role using btree (user_id) TABLESPACE pg_default;

create trigger update_user_business_role_updated_at BEFORE
update on user_business_role for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- USER ROLE
-- ======================

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
  constraint user_role_business_id_fkey foreign KEY (business_id) references business (id) on delete CASCADE,
  constraint user_role_role_id_fkey foreign KEY (role_id) references role (id) on delete CASCADE,
  constraint user_role_store_id_fkey foreign KEY (store_id) references store (id) on delete set null,
  constraint user_role_user_id_fkey foreign KEY (user_id) references "user" (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_role_user_id on public.user_role using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_role_role_id on public.user_role using btree (role_id) TABLESPACE pg_default;

create index IF not exists idx_user_role_business_id on public.user_role using btree (business_id) TABLESPACE pg_default;

create trigger update_user_role_updated_at BEFORE
update on user_role for EACH row
execute FUNCTION update_updated_at_column ();



-- ======================
-- USER ROLE VIEW
-- ======================
create view public.user_role_view as
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
  join "user" u on ur.user_id = u.id
  join role r on ur.role_id = r.id
  left join store s on ur.store_id = s.id;




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

