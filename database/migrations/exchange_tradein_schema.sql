-- ======================
-- EXCHANGE/TRADE-IN SYSTEM
-- ======================

-- Exchange Transaction Table
-- Main table for all exchange/trade-in transactions
CREATE TABLE IF NOT EXISTS public.exchange_transaction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  customer_id uuid NULL,
  cashier_id uuid NOT NULL,
  
  -- Transaction Details
  transaction_number character varying(50) NOT NULL UNIQUE,
  transaction_type character varying(20) NOT NULL,
  transaction_date timestamp without time zone DEFAULT now(),
  
  -- Original Sale (if applicable - for returns)
  original_sale_id uuid NULL,
  
  -- Trade-in Details
  trade_in_total_value numeric(10, 2) DEFAULT 0, -- Total value of items brought in
  additional_payment numeric(10, 2) DEFAULT 0,   -- Cash added by customer
  total_purchase_amount numeric(10, 2) DEFAULT 0,  -- Total for new items purchased
  
  -- Status
  status character varying(20) DEFAULT 'pending',
  
  -- Notes
  notes text,
  
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  
  CONSTRAINT exchange_transaction_pkey PRIMARY KEY (id),
  CONSTRAINT exchange_transaction_store_id_fkey FOREIGN KEY (store_id) 
    REFERENCES store(id) ON DELETE CASCADE,
  CONSTRAINT exchange_transaction_customer_id_fkey FOREIGN KEY (customer_id) 
    REFERENCES customer(id) ON DELETE SET NULL,
  CONSTRAINT exchange_transaction_cashier_id_fkey FOREIGN KEY (cashier_id) 
    REFERENCES "user"(id) ON DELETE RESTRICT,
  CONSTRAINT exchange_transaction_original_sale_id_fkey FOREIGN KEY (original_sale_id) 
    REFERENCES sale(id) ON DELETE SET NULL,
  CONSTRAINT exchange_transaction_type_check CHECK (
    transaction_type IN ('return', 'trade_in', 'exchange')
  ),
  CONSTRAINT exchange_transaction_status_check CHECK (
    status IN ('pending', 'completed', 'cancelled', 'refunded')
  )
) TABLESPACE pg_default;

-- Indexes for exchange_transaction
CREATE INDEX IF NOT EXISTS idx_exchange_transaction_store_id 
  ON public.exchange_transaction(store_id);
CREATE INDEX IF NOT EXISTS idx_exchange_transaction_customer_id 
  ON public.exchange_transaction(customer_id);
CREATE INDEX IF NOT EXISTS idx_exchange_transaction_status 
  ON public.exchange_transaction(status);
CREATE INDEX IF NOT EXISTS idx_exchange_transaction_transaction_date 
  ON public.exchange_transaction(transaction_date);
CREATE INDEX IF NOT EXISTS idx_exchange_transaction_transaction_number 
  ON public.exchange_transaction(transaction_number);
CREATE INDEX IF NOT EXISTS idx_exchange_transaction_original_sale_id 
  ON public.exchange_transaction(original_sale_id);

-- Trigger for updated_at
CREATE TRIGGER update_exchange_transaction_updated_at 
  BEFORE UPDATE ON exchange_transaction 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Exchange Item Table
-- Items being returned/traded in
CREATE TABLE IF NOT EXISTS public.exchange_item (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exchange_transaction_id uuid NOT NULL,
  
  -- Item Details
  item_type character varying(20) NOT NULL,
  
  -- For returned items (linked to original sale)
  original_sale_item_id uuid NULL,
  
  -- For trade-in items (new products or existing)
  product_id uuid NULL,
  
  -- Product Details (for trade-ins not in inventory)
  product_name character varying(255),
  product_sku character varying(100),
  product_barcode character varying(100),
  
  -- Valuation
  quantity integer NOT NULL DEFAULT 1,
  unit_value numeric(10, 2) NOT NULL, -- Value assigned to this item
  total_value numeric(10, 2) NOT NULL, -- quantity * unit_value
  
  -- Condition Assessment
  condition character varying(20) DEFAULT 'good',
  condition_notes text,
  
  -- Stock Management
  add_to_inventory boolean DEFAULT true, -- Whether to add to stock
  inventory_condition character varying(20), -- How to categorize in inventory
  
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  
  CONSTRAINT exchange_item_pkey PRIMARY KEY (id),
  CONSTRAINT exchange_item_exchange_transaction_id_fkey FOREIGN KEY (exchange_transaction_id) 
    REFERENCES exchange_transaction(id) ON DELETE CASCADE,
  CONSTRAINT exchange_item_original_sale_item_id_fkey FOREIGN KEY (original_sale_item_id) 
    REFERENCES sale_item(id) ON DELETE SET NULL,
  CONSTRAINT exchange_item_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES product(id) ON DELETE SET NULL,
  CONSTRAINT exchange_item_item_type_check CHECK (
    item_type IN ('returned', 'trade_in')
  ),
  CONSTRAINT exchange_item_condition_check CHECK (
    condition IN ('excellent', 'good', 'fair', 'damaged', 'defective')
  )
) TABLESPACE pg_default;

-- Indexes for exchange_item
CREATE INDEX IF NOT EXISTS idx_exchange_item_exchange_transaction_id 
  ON public.exchange_item(exchange_transaction_id);
CREATE INDEX IF NOT EXISTS idx_exchange_item_product_id 
  ON public.exchange_item(product_id);
CREATE INDEX IF NOT EXISTS idx_exchange_item_original_sale_item_id 
  ON public.exchange_item(original_sale_item_id);

-- Trigger for updated_at
CREATE TRIGGER update_exchange_item_updated_at 
  BEFORE UPDATE ON exchange_item 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Exchange Purchase Item Table
-- New items being purchased in the exchange
CREATE TABLE IF NOT EXISTS public.exchange_purchase_item (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exchange_transaction_id uuid NOT NULL,
  
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  discount_amount numeric(10, 2) DEFAULT 0,
  
  created_at timestamp without time zone DEFAULT now(),
  
  CONSTRAINT exchange_purchase_item_pkey PRIMARY KEY (id),
  CONSTRAINT exchange_purchase_item_exchange_transaction_id_fkey FOREIGN KEY (exchange_transaction_id) 
    REFERENCES exchange_transaction(id) ON DELETE CASCADE,
  CONSTRAINT exchange_purchase_item_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES product(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

-- Indexes for exchange_purchase_item
CREATE INDEX IF NOT EXISTS idx_exchange_purchase_item_exchange_transaction_id 
  ON public.exchange_purchase_item(exchange_transaction_id);
CREATE INDEX IF NOT EXISTS idx_exchange_purchase_item_product_id 
  ON public.exchange_purchase_item(product_id);

-- Exchange Refund Table
-- Refund records for returns
CREATE TABLE IF NOT EXISTS public.exchange_refund (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exchange_transaction_id uuid NOT NULL,
  
  refund_amount numeric(10, 2) NOT NULL,
  refund_method character varying(20) NOT NULL,
  refund_status character varying(20) DEFAULT 'pending',
  
  processed_by uuid NULL,
  processed_at timestamp without time zone,
  notes text,
  
  created_at timestamp without time zone DEFAULT now(),
  
  CONSTRAINT exchange_refund_pkey PRIMARY KEY (id),
  CONSTRAINT exchange_refund_exchange_transaction_id_fkey FOREIGN KEY (exchange_transaction_id) 
    REFERENCES exchange_transaction(id) ON DELETE CASCADE,
  CONSTRAINT exchange_refund_processed_by_fkey FOREIGN KEY (processed_by) 
    REFERENCES "user"(id) ON DELETE SET NULL,
  CONSTRAINT exchange_refund_method_check CHECK (
    refund_method IN ('cash', 'card', 'mobile', 'store_credit', 'exchange')
  ),
  CONSTRAINT exchange_refund_status_check CHECK (
    refund_status IN ('pending', 'completed', 'cancelled')
  )
) TABLESPACE pg_default;

-- Indexes for exchange_refund
CREATE INDEX IF NOT EXISTS idx_exchange_refund_exchange_transaction_id 
  ON public.exchange_refund(exchange_transaction_id);
CREATE INDEX IF NOT EXISTS idx_exchange_refund_refund_status 
  ON public.exchange_refund(refund_status);

-- ======================
-- STOCK RESTORATION FUNCTION
-- ======================

-- Function to automatically restore stock when exchange transaction is completed
CREATE OR REPLACE FUNCTION public.restore_stock_on_exchange()
RETURNS TRIGGER AS $$
DECLARE
  exchange_item_record RECORD;
  product_to_update uuid;
  stock_quantity_to_add INTEGER;
  is_new_product BOOLEAN := false;
BEGIN
  -- Only process when transaction is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Loop through all exchange items
    FOR exchange_item_record IN 
      SELECT * FROM exchange_item 
      WHERE exchange_transaction_id = NEW.id 
      AND add_to_inventory = true
    LOOP
      -- Reset flag for each item
      is_new_product := false;
      
      -- Determine product_id
      IF exchange_item_record.item_type = 'returned' AND exchange_item_record.original_sale_item_id IS NOT NULL THEN
        -- Get product_id from original sale item
        SELECT product_id INTO product_to_update
        FROM sale_item
        WHERE id = exchange_item_record.original_sale_item_id;
      ELSIF exchange_item_record.product_id IS NOT NULL THEN
        -- Use existing product_id
        product_to_update := exchange_item_record.product_id;
      ELSE
        -- Create new product for trade-in
        is_new_product := true;
        INSERT INTO product (
          store_id,
          name,
          sku,
          barcode,
          price,
          cost,
          stock_quantity,
          is_active,
          created_at,
          updated_at
        ) VALUES (
          NEW.store_id,
          COALESCE(exchange_item_record.product_name, 'Trade-in Item'),
          exchange_item_record.product_sku,
          exchange_item_record.product_barcode,
          exchange_item_record.unit_value, -- Set price to trade-in value
          exchange_item_record.unit_value, -- Cost is trade-in value
          0, -- Start with 0 stock, will be added below
          true,
          NOW(),
          NOW()
        ) RETURNING id INTO product_to_update;
        
        -- Update exchange_item with created product_id
        UPDATE exchange_item
        SET product_id = product_to_update
        WHERE id = exchange_item_record.id;
      END IF;
      
      -- Add stock based on condition
      -- For new products, this sets the stock (since it starts at 0)
      -- For existing products, this adds to existing stock
      IF exchange_item_record.condition IN ('excellent', 'good', 'fair') THEN
        -- Add full quantity for resellable items
        UPDATE product
        SET stock_quantity = stock_quantity + exchange_item_record.quantity,
            updated_at = NOW()
        WHERE id = product_to_update;
      ELSIF exchange_item_record.condition = 'damaged' THEN
        -- Add to stock but mark as damaged
        UPDATE product
        SET stock_quantity = stock_quantity + exchange_item_record.quantity,
            updated_at = NOW()
        WHERE id = product_to_update;
      ELSIF exchange_item_record.condition = 'defective' THEN
        -- Only add if add_to_inventory is true (user decision)
        IF exchange_item_record.add_to_inventory THEN
          UPDATE product
          SET stock_quantity = stock_quantity + exchange_item_record.quantity,
              updated_at = NOW()
          WHERE id = product_to_update;
        END IF;
      END IF;
      
    END LOOP;
    
    -- Reduce stock for new items purchased
    FOR exchange_item_record IN 
      SELECT * FROM exchange_purchase_item 
      WHERE exchange_transaction_id = NEW.id
    LOOP
      UPDATE product
      SET stock_quantity = GREATEST(0, stock_quantity - exchange_item_record.quantity),
          updated_at = NOW()
      WHERE id = exchange_item_record.product_id;
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically restore stock
CREATE TRIGGER trigger_restore_stock_on_exchange
  AFTER UPDATE ON exchange_transaction
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_exchange();

