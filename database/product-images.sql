-- =====================================================
-- PRODUCT IMAGES SQL QUERIES
-- =====================================================
-- This script adds image_url for all existing products
-- based on their product names for better visual representation

-- =====================================================
-- UPDATE EXISTING PRODUCTS WITH IMAGE_URL
-- =====================================================

-- Update products with generic product images based on name patterns
UPDATE product 
SET image_url = CASE
  -- Electronics
  WHEN LOWER(name) LIKE '%phone%' OR LOWER(name) LIKE '%mobile%' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%computer%' THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%tablet%' OR LOWER(name) LIKE '%ipad%' THEN 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%headphone%' OR LOWER(name) LIKE '%earphone%' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%camera%' OR LOWER(name) LIKE '%photo%' THEN 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop'
  
  -- Clothing & Fashion
  WHEN LOWER(name) LIKE '%shirt%' OR LOWER(name) LIKE '%t-shirt%' THEN 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%pant%' OR LOWER(name) LIKE '%jean%' THEN 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%dress%' OR LOWER(name) LIKE '%gown%' THEN 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%shoe%' OR LOWER(name) LIKE '%sneaker%' THEN 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%bag%' OR LOWER(name) LIKE '%purse%' THEN 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop'
  
  -- Food & Beverages
  WHEN LOWER(name) LIKE '%bread%' OR LOWER(name) LIKE '%cake%' THEN 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%fruit%' OR LOWER(name) LIKE '%apple%' OR LOWER(name) LIKE '%banana%' THEN 'https://images.unsplash.com/photo-1619566636858-adc3d3e9e4c4?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%vegetable%' OR LOWER(name) LIKE '%tomato%' OR LOWER(name) LIKE '%carrot%' THEN 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%yogurt%' THEN 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%water%' OR LOWER(name) LIKE '%juice%' THEN 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop'
  
  -- Home & Kitchen
  WHEN LOWER(name) LIKE '%plate%' OR LOWER(name) LIKE '%bowl%' THEN 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%cup%' OR LOWER(name) LIKE '%mug%' THEN 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%pan%' OR LOWER(name) LIKE '%pot%' THEN 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%towel%' OR LOWER(name) LIKE '%cloth%' THEN 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop'
  
  -- Books & Stationery
  WHEN LOWER(name) LIKE '%book%' OR LOWER(name) LIKE '%magazine%' THEN 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%pen%' OR LOWER(name) LIKE '%pencil%' THEN 'https://images.unsplash.com/photo-1583485088034-697b5bc36b55?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%notebook%' OR LOWER(name) LIKE '%paper%' THEN 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop'
  
  -- Sports & Outdoor
  WHEN LOWER(name) LIKE '%ball%' OR LOWER(name) LIKE '%football%' OR LOWER(name) LIKE '%basketball%' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%bike%' OR LOWER(name) LIKE '%bicycle%' THEN 'https://images.unsplash.com/photo-1532298223-f0c5a0a0b8a0?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%tent%' OR LOWER(name) LIKE '%camping%' THEN 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&h=400&fit=crop'
  
  -- Health & Beauty
  WHEN LOWER(name) LIKE '%soap%' OR LOWER(name) LIKE '%shampoo%' THEN 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%cream%' OR LOWER(name) LIKE '%lotion%' THEN 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%vitamin%' OR LOWER(name) LIKE '%medicine%' THEN 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
  
  -- Toys & Games
  WHEN LOWER(name) LIKE '%toy%' OR LOWER(name) LIKE '%game%' THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%puzzle%' OR LOWER(name) LIKE '%board%' THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  
  -- Automotive
  WHEN LOWER(name) LIKE '%car%' OR LOWER(name) LIKE '%tire%' THEN 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop'
  WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%fuel%' THEN 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop'
  
  -- Default generic product image
  ELSE 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop'
END
WHERE image_url IS NULL OR image_url = '';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check how many products were updated
SELECT 
  COUNT(*) as total_products,
  COUNT(image_url) as products_with_images,
  COUNT(*) - COUNT(image_url) as products_without_images
FROM product;

-- Show sample of updated products
SELECT 
  name,
  image_url,
  CASE 
    WHEN image_url IS NOT NULL THEN 'Has Image'
    ELSE 'No Image'
  END as status
FROM product 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- CLEANUP (OPTIONAL)
-- =====================================================

-- If you want to remove the temporary image URLs later, you can run:
-- UPDATE products SET image_url = NULL WHERE image_url LIKE 'https://images.unsplash.com%';

-- =====================================================
-- PRODUCT IMAGES UPDATE COMPLETE
-- =====================================================
