-- ========================================
-- SUPPLY/CONSIGNMENT MANAGEMENT SYSTEM
-- ========================================

-- Supply Order - Main table for tracking items supplied without payment
CREATE TABLE public.supply_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.store(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE RESTRICT,
  cashier_id UUID NOT NULL REFERENCES public.user(id) ON DELETE RESTRICT,
  supply_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'SUP-001-2024'
  status VARCHAR(20) NOT NULL DEFAULT 'supplied' CHECK (status IN ('supplied', 'partially_returned', 'fully_returned', 'completed', 'cancelled')),
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  supply_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  expected_return_date TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Supply Order Items - Items in each supply order
CREATE TABLE public.supply_order_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_order_id UUID NOT NULL REFERENCES public.supply_order(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.product(id) ON DELETE RESTRICT,
  quantity_supplied INTEGER NOT NULL DEFAULT 0,
  quantity_returned INTEGER NOT NULL DEFAULT 0,
  quantity_accepted INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  return_reason TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT supply_order_item_quantity_check CHECK (quantity_supplied >= 0 AND quantity_returned >= 0 AND quantity_accepted >= 0),
  CONSTRAINT supply_order_item_quantity_logic_check CHECK (quantity_returned + quantity_accepted <= quantity_supplied)
);

-- Supply Return - Track return transactions
CREATE TABLE public.supply_return (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_order_id UUID NOT NULL REFERENCES public.supply_order(id) ON DELETE CASCADE,
  return_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'RET-001-2024'
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'cancelled')),
  total_returned_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  return_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  processed_by UUID REFERENCES public.user(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Supply Return Items - Items being returned
CREATE TABLE public.supply_return_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_return_id UUID NOT NULL REFERENCES public.supply_return(id) ON DELETE CASCADE,
  supply_order_item_id UUID NOT NULL REFERENCES public.supply_order_item(id) ON DELETE CASCADE,
  quantity_returned INTEGER NOT NULL DEFAULT 0,
  return_reason TEXT,
  condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'defective', 'expired')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Supply Payment - Track payments for accepted items
CREATE TABLE public.supply_payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_order_id UUID NOT NULL REFERENCES public.supply_order(id) ON DELETE CASCADE,
  payment_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'PAY-001-2024'
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'mobile', 'other')),
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  processed_by UUID REFERENCES public.user(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_supply_order_store_id ON public.supply_order(store_id);
CREATE INDEX idx_supply_order_customer_id ON public.supply_order(customer_id);
CREATE INDEX idx_supply_order_status ON public.supply_order(status);
CREATE INDEX idx_supply_order_supply_date ON public.supply_order(supply_date);
CREATE INDEX idx_supply_order_supply_number ON public.supply_order(supply_number);

CREATE INDEX idx_supply_order_item_supply_order_id ON public.supply_order_item(supply_order_id);
CREATE INDEX idx_supply_order_item_product_id ON public.supply_order_item(product_id);

CREATE INDEX idx_supply_return_supply_order_id ON public.supply_return(supply_order_id);
CREATE INDEX idx_supply_return_status ON public.supply_return(status);
CREATE INDEX idx_supply_return_return_date ON public.supply_return(return_date);

CREATE INDEX idx_supply_return_item_supply_return_id ON public.supply_return_item(supply_return_id);
CREATE INDEX idx_supply_return_item_supply_order_item_id ON public.supply_return_item(supply_order_item_id);

CREATE INDEX idx_supply_payment_supply_order_id ON public.supply_payment(supply_order_id);
CREATE INDEX idx_supply_payment_payment_date ON public.supply_payment(payment_date);

-- Create triggers for updated_at
CREATE TRIGGER update_supply_order_updated_at BEFORE UPDATE ON public.supply_order FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supply_order_item_updated_at BEFORE UPDATE ON public.supply_order_item FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supply_return_updated_at BEFORE UPDATE ON public.supply_return FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supply_return_item_updated_at BEFORE UPDATE ON public.supply_return_item FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supply_payment_updated_at BEFORE UPDATE ON public.supply_payment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- SUPPLY MANAGEMENT FUNCTIONS
-- ========================================

-- Function to generate supply order number
CREATE OR REPLACE FUNCTION public.generate_supply_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  supply_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the next number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(so.supply_number FROM 'SUP-(\d+)-' || current_year) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.supply_order so
  WHERE so.supply_number LIKE 'SUP-%-' || current_year;
  
  supply_number := 'SUP-' || LPAD(next_number::TEXT, 3, '0') || '-' || current_year;
  
  RETURN supply_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate return number
CREATE OR REPLACE FUNCTION public.generate_return_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  return_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the next number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(sr.return_number FROM 'RET-(\d+)-' || current_year) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.supply_return sr
  WHERE sr.return_number LIKE 'RET-%-' || current_year;
  
  return_number := 'RET-' || LPAD(next_number::TEXT, 3, '0') || '-' || current_year;
  
  RETURN return_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate payment number
CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  payment_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the next number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(sp.payment_number FROM 'PAY-(\d+)-' || current_year) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.supply_payment sp
  WHERE sp.payment_number LIKE 'PAY-%-' || current_year;
  
  payment_number := 'PAY-' || LPAD(next_number::TEXT, 3, '0') || '-' || current_year;
  
  RETURN payment_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update supply order status based on items
CREATE OR REPLACE FUNCTION public.update_supply_order_status()
RETURNS TRIGGER AS $$
DECLARE
  order_id UUID;
  total_supplied INTEGER;
  total_returned INTEGER;
  total_accepted INTEGER;
  new_status VARCHAR(20);
BEGIN
  -- Get the supply order ID
  IF TG_TABLE_NAME = 'supply_order_item' THEN
    order_id := NEW.supply_order_id;
  ELSIF TG_TABLE_NAME = 'supply_return_item' THEN
    SELECT soi.supply_order_id INTO order_id
    FROM public.supply_order_item soi
    WHERE soi.id = NEW.supply_order_item_id;
  END IF;
  
  -- Calculate totals for the supply order
  SELECT 
    SUM(quantity_supplied),
    SUM(quantity_returned),
    SUM(quantity_accepted)
  INTO total_supplied, total_returned, total_accepted
  FROM public.supply_order_item
  WHERE supply_order_id = order_id;
  
  -- Determine new status
  IF total_accepted = total_supplied THEN
    new_status := 'completed';
  ELSIF total_returned = total_supplied THEN
    new_status := 'fully_returned';
  ELSIF total_returned > 0 THEN
    new_status := 'partially_returned';
  ELSE
    new_status := 'supplied';
  END IF;
  
  -- Update the supply order status
  UPDATE public.supply_order
  SET status = new_status, updated_at = NOW()
  WHERE id = order_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update supply order status
CREATE TRIGGER trigger_update_supply_order_status_item
  AFTER INSERT OR UPDATE ON public.supply_order_item
  FOR EACH ROW EXECUTE FUNCTION public.update_supply_order_status();

CREATE TRIGGER trigger_update_supply_order_status_return
  AFTER INSERT OR UPDATE ON public.supply_return_item
  FOR EACH ROW EXECUTE FUNCTION public.update_supply_order_status();

-- Function to reduce stock when items are supplied
CREATE OR REPLACE FUNCTION public.reduce_stock_on_supply()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduce stock quantity when items are supplied
  UPDATE public.product
  SET stock_quantity = stock_quantity - NEW.quantity_supplied,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to restore stock when items are returned
CREATE OR REPLACE FUNCTION public.restore_stock_on_return()
RETURNS TRIGGER AS $$
DECLARE
  product_id UUID;
  quantity_returned INTEGER;
BEGIN
  -- Get product ID and quantity from supply order item
  SELECT soi.product_id, NEW.quantity_returned
  INTO product_id, quantity_returned
  FROM public.supply_order_item soi
  WHERE soi.id = NEW.supply_order_item_id;
  
  -- Restore stock quantity when items are returned
  UPDATE public.product
  SET stock_quantity = stock_quantity + quantity_returned,
      updated_at = NOW()
  WHERE id = product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for stock management
CREATE TRIGGER trigger_reduce_stock_on_supply
  AFTER INSERT ON public.supply_order_item
  FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_supply();

CREATE TRIGGER trigger_restore_stock_on_return
  AFTER INSERT ON public.supply_return_item
  FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_return();

-- ========================================
-- SUPPLY MANAGEMENT VIEWS
-- ========================================

-- View for supply order summary
CREATE VIEW public.supply_order_summary AS
SELECT 
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
  COUNT(soi.id) as total_items,
  SUM(soi.quantity_supplied) as total_quantity_supplied,
  SUM(soi.quantity_returned) as total_quantity_returned,
  SUM(soi.quantity_accepted) as total_quantity_accepted
FROM public.supply_order so
JOIN public.customer c ON so.customer_id = c.id
JOIN public.user u ON so.cashier_id = u.id
JOIN public.store s ON so.store_id = s.id
LEFT JOIN public.supply_order_item soi ON so.id = soi.supply_order_id
GROUP BY so.id, so.supply_number, so.status, so.supply_date, so.expected_return_date, 
         so.total_amount, c.name, c.phone, u.name, s.name;

-- View for supply order items with product details
CREATE VIEW public.supply_order_items_detail AS
SELECT 
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
  (soi.quantity_supplied - soi.quantity_returned - soi.quantity_accepted) as quantity_pending
FROM public.supply_order_item soi
JOIN public.supply_order so ON soi.supply_order_id = so.id
JOIN public.product p ON soi.product_id = p.id;

-- View for pending returns
CREATE VIEW public.pending_returns AS
SELECT 
  so.id as supply_order_id,
  so.supply_number,
  c.name as customer_name,
  c.phone as customer_phone,
  so.supply_date,
  so.expected_return_date,
  COUNT(soi.id) as items_pending_return,
  SUM(soi.quantity_supplied - soi.quantity_returned - soi.quantity_accepted) as total_quantity_pending
FROM public.supply_order so
JOIN public.customer c ON so.customer_id = c.id
JOIN public.supply_order_item soi ON so.id = soi.supply_order_id
WHERE so.status IN ('supplied', 'partially_returned')
  AND (soi.quantity_supplied - soi.quantity_returned - soi.quantity_accepted) > 0
GROUP BY so.id, so.supply_number, c.name, c.phone, so.supply_date, so.expected_return_date;

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Insert sample supply orders (uncomment if needed for testing)
/*
INSERT INTO public.supply_order (store_id, customer_id, cashier_id, supply_number, status, subtotal, total_amount, notes, expected_return_date) VALUES
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440053', 'SUP-001-2024', 'supplied', 1500.00, 1500.00, 'Initial supply to customer', CURRENT_DATE + INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440054', 'SUP-002-2024', 'partially_returned', 2000.00, 2000.00, 'Partial return received', CURRENT_DATE + INTERVAL '5 days');
*/
