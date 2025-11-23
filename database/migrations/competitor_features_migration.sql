-- ======================
-- COMPETITOR FEATURES MIGRATION
-- Implements missing features from competitor analysis
-- ======================

-- ======================
-- 1. STOCK TRANSFER SYSTEM
-- ======================
-- Move stock quantities between stores (different from ProductSync which copies product definitions)

CREATE TABLE IF NOT EXISTS public.stock_transfer (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_store_id uuid NOT NULL,
  to_store_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  transfer_date timestamp without time zone DEFAULT now(),
  status character varying(20) DEFAULT 'pending',
  notes text,
  created_by uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT stock_transfer_pkey PRIMARY KEY (id),
  CONSTRAINT stock_transfer_from_store_id_fkey FOREIGN KEY (from_store_id) 
    REFERENCES store(id) ON DELETE CASCADE,
  CONSTRAINT stock_transfer_to_store_id_fkey FOREIGN KEY (to_store_id) 
    REFERENCES store(id) ON DELETE CASCADE,
  CONSTRAINT stock_transfer_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES product(id) ON DELETE RESTRICT,
  CONSTRAINT stock_transfer_created_by_fkey FOREIGN KEY (created_by) 
    REFERENCES "user"(id) ON DELETE RESTRICT,
  CONSTRAINT stock_transfer_status_check CHECK (
    status IN ('pending', 'in_transit', 'completed', 'cancelled')
  ),
  CONSTRAINT stock_transfer_quantity_check CHECK (quantity > 0),
  CONSTRAINT stock_transfer_different_stores_check CHECK (from_store_id != to_store_id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_stock_transfer_from_store_id 
  ON public.stock_transfer(from_store_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_to_store_id 
  ON public.stock_transfer(to_store_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_product_id 
  ON public.stock_transfer(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_status 
  ON public.stock_transfer(status);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_transfer_date 
  ON public.stock_transfer(transfer_date);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_created_by 
  ON public.stock_transfer(created_by);

CREATE TRIGGER update_stock_transfer_updated_at 
  BEFORE UPDATE ON stock_transfer 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to process stock transfer (reduce from source, add to destination)
CREATE OR REPLACE FUNCTION public.process_stock_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Reduce stock from source store
    UPDATE product 
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity),
        updated_at = NOW()
    WHERE id = NEW.product_id 
      AND store_id = NEW.from_store_id;
    
    -- Check if product exists in destination store
    IF EXISTS (
      SELECT 1 FROM product 
      WHERE id = NEW.product_id 
        AND store_id = NEW.to_store_id
    ) THEN
      -- Add stock to existing product in destination store
      UPDATE product 
      SET stock_quantity = stock_quantity + NEW.quantity,
          updated_at = NOW()
      WHERE id = NEW.product_id 
        AND store_id = NEW.to_store_id;
    ELSE
      -- Product doesn't exist in destination store - create it from source product
      INSERT INTO product (
        store_id,
        business_id,
        name,
        description,
        sku,
        barcode,
        price,
        cost,
        stock_quantity,
        min_stock_level,
        reorder_level,
        max_stock_level,
        category_id,
        supplier_id,
        brand_id,
        image_url,
        is_active,
        is_public,
        public_description,
        public_images,
        created_at,
        updated_at
      )
      SELECT 
        NEW.to_store_id,
        business_id,
        name,
        description,
        sku,
        barcode,
        price,
        cost,
        NEW.quantity, -- Initial stock is the transferred quantity
        min_stock_level,
        reorder_level,
        max_stock_level,
        category_id,
        supplier_id,
        brand_id,
        image_url,
        is_active,
        is_public,
        public_description,
        public_images,
        NOW(),
        NOW()
      FROM product
      WHERE id = NEW.product_id 
        AND store_id = NEW.from_store_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_stock_transfer
  AFTER UPDATE ON stock_transfer
  FOR EACH ROW
  EXECUTE FUNCTION process_stock_transfer();

-- ======================
-- 2. STOCK ADJUSTMENT SYSTEM
-- ======================
-- Rectify stock discrepancies with reason and date

CREATE TABLE IF NOT EXISTS public.stock_adjustment (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity_change integer NOT NULL, -- Can be positive (increase) or negative (decrease)
  reason text NOT NULL,
  adjustment_date timestamp without time zone DEFAULT now(),
  created_by uuid NOT NULL,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT stock_adjustment_pkey PRIMARY KEY (id),
  CONSTRAINT stock_adjustment_store_id_fkey FOREIGN KEY (store_id) 
    REFERENCES store(id) ON DELETE CASCADE,
  CONSTRAINT stock_adjustment_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES product(id) ON DELETE RESTRICT,
  CONSTRAINT stock_adjustment_created_by_fkey FOREIGN KEY (created_by) 
    REFERENCES "user"(id) ON DELETE RESTRICT,
  CONSTRAINT stock_adjustment_quantity_change_check CHECK (quantity_change != 0)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_stock_adjustment_store_id 
  ON public.stock_adjustment(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_product_id 
  ON public.stock_adjustment(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_adjustment_date 
  ON public.stock_adjustment(adjustment_date);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_created_by 
  ON public.stock_adjustment(created_by);

CREATE TRIGGER update_stock_adjustment_updated_at 
  BEFORE UPDATE ON stock_adjustment 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to apply stock adjustment
CREATE OR REPLACE FUNCTION public.apply_stock_adjustment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product stock quantity
  UPDATE product 
  SET stock_quantity = GREATEST(0, stock_quantity + NEW.quantity_change),
      updated_at = NOW()
  WHERE id = NEW.product_id 
    AND store_id = NEW.store_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_apply_stock_adjustment
  AFTER INSERT ON stock_adjustment
  FOR EACH ROW
  EXECUTE FUNCTION apply_stock_adjustment();

-- ======================
-- 3. SALE RETURN SYSTEM
-- ======================
-- Return items from completed sales

CREATE TABLE IF NOT EXISTS public.sale_return (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL,
  return_number character varying(100) NOT NULL UNIQUE,
  store_id uuid NOT NULL,
  cashier_id uuid NOT NULL,
  customer_id uuid NULL,
  total_return_amount numeric(10, 2) NOT NULL DEFAULT 0,
  refund_method character varying(20) DEFAULT 'cash',
  refund_status character varying(20) DEFAULT 'pending',
  return_reason text,
  notes text,
  return_date timestamp without time zone DEFAULT now(),
  processed_by uuid NULL,
  processed_at timestamp without time zone NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT sale_return_pkey PRIMARY KEY (id),
  CONSTRAINT sale_return_sale_id_fkey FOREIGN KEY (sale_id) 
    REFERENCES sale(id) ON DELETE RESTRICT,
  CONSTRAINT sale_return_store_id_fkey FOREIGN KEY (store_id) 
    REFERENCES store(id) ON DELETE CASCADE,
  CONSTRAINT sale_return_cashier_id_fkey FOREIGN KEY (cashier_id) 
    REFERENCES "user"(id) ON DELETE RESTRICT,
  CONSTRAINT sale_return_customer_id_fkey FOREIGN KEY (customer_id) 
    REFERENCES customer(id) ON DELETE SET NULL,
  CONSTRAINT sale_return_processed_by_fkey FOREIGN KEY (processed_by) 
    REFERENCES "user"(id) ON DELETE SET NULL,
  CONSTRAINT sale_return_refund_method_check CHECK (
    refund_method IN ('cash', 'card', 'mobile', 'store_credit', 'exchange')
  ),
  CONSTRAINT sale_return_refund_status_check CHECK (
    refund_status IN ('pending', 'completed', 'cancelled')
  )
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.sale_return_item (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_return_id uuid NOT NULL,
  sale_item_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity_returned integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total_return_amount numeric(10, 2) NOT NULL,
  return_reason text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT sale_return_item_pkey PRIMARY KEY (id),
  CONSTRAINT sale_return_item_sale_return_id_fkey FOREIGN KEY (sale_return_id) 
    REFERENCES sale_return(id) ON DELETE CASCADE,
  CONSTRAINT sale_return_item_sale_item_id_fkey FOREIGN KEY (sale_item_id) 
    REFERENCES sale_item(id) ON DELETE RESTRICT,
  CONSTRAINT sale_return_item_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES product(id) ON DELETE RESTRICT,
  CONSTRAINT sale_return_item_quantity_returned_check CHECK (quantity_returned > 0)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_sale_return_sale_id 
  ON public.sale_return(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_return_store_id 
  ON public.sale_return(store_id);
CREATE INDEX IF NOT EXISTS idx_sale_return_return_number 
  ON public.sale_return(return_number);
CREATE INDEX IF NOT EXISTS idx_sale_return_refund_status 
  ON public.sale_return(refund_status);
CREATE INDEX IF NOT EXISTS idx_sale_return_item_sale_return_id 
  ON public.sale_return_item(sale_return_id);
CREATE INDEX IF NOT EXISTS idx_sale_return_item_product_id 
  ON public.sale_return_item(product_id);

CREATE TRIGGER update_sale_return_updated_at 
  BEFORE UPDATE ON sale_return 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to restore stock on sale return
CREATE OR REPLACE FUNCTION public.restore_stock_on_sale_return()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when refund status changes to 'completed'
  IF NEW.refund_status = 'completed' AND (OLD.refund_status IS NULL OR OLD.refund_status != 'completed') THEN
    -- Restore stock for all returned items
    UPDATE product 
    SET stock_quantity = stock_quantity + sri.quantity_returned,
        updated_at = NOW()
    FROM sale_return_item sri
    WHERE sri.sale_return_id = NEW.id
      AND product.id = sri.product_id
      AND product.store_id = NEW.store_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restore_stock_on_sale_return
  AFTER UPDATE ON sale_return
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_sale_return();

-- ======================
-- 4. QUOTATION SYSTEM
-- ======================

CREATE TABLE IF NOT EXISTS public.quotation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  store_id uuid NULL, -- null means applies to all stores
  quotation_number character varying(100) NOT NULL UNIQUE,
  customer_name character varying(255) NOT NULL,
  customer_email character varying(255) NULL,
  customer_phone character varying(50) NULL,
  customer_address text NULL,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  tax_amount numeric(10, 2) NOT NULL DEFAULT 0,
  discount_amount numeric(10, 2) NOT NULL DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  bank_account_info jsonb NULL, -- Store bank account details
  status character varying(20) DEFAULT 'draft',
  expires_at timestamp without time zone NULL,
  notes text NULL,
  created_by uuid NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT quotation_pkey PRIMARY KEY (id),
  CONSTRAINT quotation_business_id_fkey FOREIGN KEY (business_id) 
    REFERENCES business(id) ON DELETE CASCADE,
  CONSTRAINT quotation_store_id_fkey FOREIGN KEY (store_id) 
    REFERENCES store(id) ON DELETE CASCADE,
  CONSTRAINT quotation_created_by_fkey FOREIGN KEY (created_by) 
    REFERENCES "user"(id) ON DELETE SET NULL,
  CONSTRAINT quotation_status_check CHECK (
    status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')
  )
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.quotation_item (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL,
  product_id uuid NULL, -- null for custom items not in store
  item_name character varying(255) NOT NULL,
  description text NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  is_custom_item boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT quotation_item_pkey PRIMARY KEY (id),
  CONSTRAINT quotation_item_quotation_id_fkey FOREIGN KEY (quotation_id) 
    REFERENCES quotation(id) ON DELETE CASCADE,
  CONSTRAINT quotation_item_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES product(id) ON DELETE SET NULL,
  CONSTRAINT quotation_item_quantity_check CHECK (quantity > 0)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_quotation_business_id 
  ON public.quotation(business_id);
CREATE INDEX IF NOT EXISTS idx_quotation_store_id 
  ON public.quotation(store_id);
CREATE INDEX IF NOT EXISTS idx_quotation_quotation_number 
  ON public.quotation(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotation_status 
  ON public.quotation(status);
CREATE INDEX IF NOT EXISTS idx_quotation_item_quotation_id 
  ON public.quotation_item(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_item_product_id 
  ON public.quotation_item(product_id);

CREATE TRIGGER update_quotation_updated_at 
  BEFORE UPDATE ON quotation 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- 5. FINANCIAL EXPENSES
-- ======================

CREATE TABLE IF NOT EXISTS public.expense (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  store_id uuid NULL, -- null means business-level expense
  category character varying(100) NOT NULL,
  amount numeric(10, 2) NOT NULL,
  description text NULL,
  expense_date timestamp without time zone DEFAULT now(),
  payment_method character varying(20) DEFAULT 'cash',
  created_by uuid NOT NULL,
  notes text NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT expense_pkey PRIMARY KEY (id),
  CONSTRAINT expense_business_id_fkey FOREIGN KEY (business_id) 
    REFERENCES business(id) ON DELETE CASCADE,
  CONSTRAINT expense_store_id_fkey FOREIGN KEY (store_id) 
    REFERENCES store(id) ON DELETE CASCADE,
  CONSTRAINT expense_created_by_fkey FOREIGN KEY (created_by) 
    REFERENCES "user"(id) ON DELETE RESTRICT,
  CONSTRAINT expense_amount_check CHECK (amount > 0),
  CONSTRAINT expense_payment_method_check CHECK (
    payment_method IN ('cash', 'card', 'mobile', 'bank_transfer', 'other')
  )
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_expense_business_id 
  ON public.expense(business_id);
CREATE INDEX IF NOT EXISTS idx_expense_store_id 
  ON public.expense(store_id);
CREATE INDEX IF NOT EXISTS idx_expense_category 
  ON public.expense(category);
CREATE INDEX IF NOT EXISTS idx_expense_expense_date 
  ON public.expense(expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_created_by 
  ON public.expense(created_by);

CREATE TRIGGER update_expense_updated_at 
  BEFORE UPDATE ON expense 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- 6. ENHANCE SALE TABLE
-- ======================

-- Add delivery_cost column
ALTER TABLE public.sale 
ADD COLUMN IF NOT EXISTS delivery_cost numeric(10, 2) DEFAULT 0;

-- Enhance payment_status enum (modify constraint)
ALTER TABLE public.sale 
DROP CONSTRAINT IF EXISTS sale_payment_status_check;

-- Update payment_status to support partial payments
-- Note: We'll use a check constraint since PostgreSQL doesn't support ALTER TYPE easily
DO $$ 
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE public.sale DROP CONSTRAINT IF EXISTS sale_payment_status_check;
  
  -- Add new constraint with enhanced statuses
  ALTER TABLE public.sale 
  ADD CONSTRAINT sale_payment_status_check CHECK (
    payment_status IN ('pending', 'partial', 'fully_paid', 'completed', 'overdue', 'cancelled')
  );
END $$;

-- Add payment_history tracking (store as JSONB for flexibility)
ALTER TABLE public.sale 
ADD COLUMN IF NOT EXISTS payment_history jsonb DEFAULT '[]'::jsonb;

-- Add is_editable flag (for allowing edits to completed sales)
ALTER TABLE public.sale 
ADD COLUMN IF NOT EXISTS is_editable boolean DEFAULT true;

-- ======================
-- 7. ENHANCE PRODUCT TABLE
-- ======================

-- Add unit field for product units (packets, dozen, etc.)
ALTER TABLE public.product 
ADD COLUMN IF NOT EXISTS unit character varying(50) DEFAULT 'piece';

-- Add auto_generated_code flag
ALTER TABLE public.product 
ADD COLUMN IF NOT EXISTS auto_generated_code boolean DEFAULT false;

-- ======================
-- 8. ENHANCE BUSINESS/STORE SETTINGS
-- ======================

-- Add bank_accounts to business_setting
ALTER TABLE public.business_setting 
ADD COLUMN IF NOT EXISTS bank_accounts jsonb DEFAULT '[]'::jsonb;

-- Add bank_accounts to store_setting
ALTER TABLE public.store_setting 
ADD COLUMN IF NOT EXISTS bank_accounts jsonb DEFAULT '[]'::jsonb;

-- ======================
-- 9. CREATE VIEWS FOR REPORTING
-- ======================

-- Stock Transfer Summary View
CREATE OR REPLACE VIEW public.stock_transfer_summary AS
SELECT 
  st.id,
  st.transfer_date,
  st.status,
  st.quantity,
  st.notes,
  p.name as product_name,
  p.sku,
  fs.name as from_store_name,
  ts.name as to_store_name,
  u.name as created_by_name,
  st.created_at,
  st.updated_at
FROM stock_transfer st
JOIN product p ON st.product_id = p.id
JOIN store fs ON st.from_store_id = fs.id
JOIN store ts ON st.to_store_id = ts.id
JOIN "user" u ON st.created_by = u.id;

-- Stock Adjustment Summary View
CREATE OR REPLACE VIEW public.stock_adjustment_summary AS
SELECT 
  sa.id,
  sa.adjustment_date,
  sa.quantity_change,
  sa.reason,
  sa.notes,
  p.name as product_name,
  p.sku,
  s.name as store_name,
  u.name as created_by_name,
  sa.created_at,
  sa.updated_at
FROM stock_adjustment sa
JOIN product p ON sa.product_id = p.id
JOIN store s ON sa.store_id = s.id
JOIN "user" u ON sa.created_by = u.id;

-- Sale Return Summary View
CREATE OR REPLACE VIEW public.sale_return_summary AS
SELECT 
  sr.id,
  sr.return_number,
  sr.return_date,
  sr.total_return_amount,
  sr.refund_method,
  sr.refund_status,
  sr.return_reason,
  s.receipt_number as original_receipt_number,
  st.name as store_name,
  c.name as customer_name,
  u.name as cashier_name,
  sr.created_at,
  sr.updated_at
FROM sale_return sr
JOIN sale s ON sr.sale_id = s.id
JOIN store st ON sr.store_id = st.id
LEFT JOIN customer c ON sr.customer_id = c.id
JOIN "user" u ON sr.cashier_id = u.id;

-- Expense Summary View
CREATE OR REPLACE VIEW public.expense_summary AS
SELECT 
  e.id,
  e.expense_date,
  e.category,
  e.amount,
  e.description,
  e.payment_method,
  b.name as business_name,
  s.name as store_name,
  u.name as created_by_name,
  e.created_at,
  e.updated_at
FROM expense e
JOIN business b ON e.business_id = b.id
LEFT JOIN store s ON e.store_id = s.id
JOIN "user" u ON e.created_by = u.id;

