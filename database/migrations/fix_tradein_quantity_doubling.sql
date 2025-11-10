-- ======================
-- FIX TRADE-IN QUANTITY DOUBLING AND PRICE ISSUE
-- ======================
-- This migration fixes two issues:
-- 1. Trade-in items were having their quantity doubled when added to inventory
-- 2. Trade-in items were created with price = 0 instead of the trade-in value
--
-- Date: 2024
-- ======================

-- Update the restore_stock_on_exchange function to fix quantity doubling and price issues
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
          exchange_item_record.unit_value, -- Set price to trade-in value (FIXED: was 0)
          exchange_item_record.unit_value, -- Cost is trade-in value
          0, -- Start with 0 stock, will be added below (FIXED: was exchange_item_record.quantity)
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

-- Note: The trigger already exists, so we don't need to recreate it
-- The function replacement above will automatically update the trigger behavior

