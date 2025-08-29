-- Sample Data for SCIMS Application
-- This script populates essential tables with realistic data

-- Insert Countries
INSERT INTO public.country (id, code, name, phone_code, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'US', 'United States', '+1', true),
('550e8400-e29b-41d4-a716-446655440002', 'NG', 'Nigeria', '+234', true),
('550e8400-e29b-41d4-a716-446655440003', 'GB', 'United Kingdom', '+44', true),
('550e8400-e29b-41d4-a716-446655440004', 'CA', 'Canada', '+1', true),
('550e8400-e29b-41d4-a716-446655440005', 'AU', 'Australia', '+61', true);

-- Insert Currencies
INSERT INTO public.currency (id, code, name, symbol, is_active, decimals) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'USD', 'US Dollar', '$', true, 2),
('550e8400-e29b-41d4-a716-446655440012', 'NGN', 'Nigerian Naira', '₦', true, 2),
('550e8400-e29b-41d4-a716-446655440013', 'GBP', 'British Pound', '£', true, 2),
('550e8400-e29b-41d4-a716-446655440014', 'CAD', 'Canadian Dollar', 'C$', true, 2),
('550e8400-e29b-41d4-a716-446655440015', 'AUD', 'Australian Dollar', 'A$', true, 2);

-- Insert Languages
INSERT INTO public.language (id, code, name, native_name, is_active, rtl) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'en', 'English', 'English', true, false),
('550e8400-e29b-41d4-a716-446655440022', 'es', 'Spanish', 'Español', true, false),
('550e8400-e29b-41d4-a716-446655440023', 'fr', 'French', 'Français', true, false),
('550e8400-e29b-41d4-a716-446655440024', 'ar', 'Arabic', 'العربية', true, true),
('550e8400-e29b-41d4-a716-446655440025', 'zh', 'Chinese', '中文', true, false);

-- Insert Subscription Plans
INSERT INTO public.subscription_plan (id, name, price_monthly, price_yearly, description, features, max_stores, max_products, max_users, is_active, display_order) VALUES
('550e8400-e29b-41d4-a716-446655440031', 'Starter', 29.99, 299.99, 'Perfect for small businesses', '["Basic POS", "Inventory Management", "Basic Reports"]', 1, 100, 3, true, 1),
('550e8400-e29b-41d4-a716-446655440032', 'Professional', 79.99, 799.99, 'Ideal for growing businesses', '["Advanced POS", "Multi-store", "Advanced Analytics", "Customer Management"]', 3, 500, 10, true, 2),
('550e8400-e29b-41d4-a716-446655440033', 'Enterprise', 199.99, 1999.99, 'For large operations', '["Unlimited Stores", "Unlimited Products", "Unlimited Users", "Custom Integrations", "Priority Support"]', 999, 9999, 999, true, 3);

-- Insert Platform Settings
INSERT INTO public.platform_setting (id, platform_name, platform_version, default_currency, default_language, timezone, demo_mode, maintenance_mode) VALUES
('550e8400-e29b-41d4-a716-446655440041', 'SCIMS', '1.0.0', 'USD', 'en', 'UTC', false, false);

-- Insert Users
INSERT INTO public.user (id, username, email, password_hash, name, role, is_active, is_demo, phone) VALUES
-- Superadmin
('550e8400-e29b-41d4-a716-446655440051', 'superadmin', 'admin@scims.com', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'System Administrator', 'superadmin', true, '+1234567890'),
-- Business Admin
('550e8400-e29b-41d4-a716-446655440052', 'businessadmin', 'admin@techmart.com', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'John Smith', 'business_admin', true, '+1234567891'),
-- Store Admin
('550e8400-e29b-41d4-a716-446655440053', 'storeadmin', 'manager@techmart.com', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'Sarah Johnson', 'store_admin', true, '+1234567892'),
-- Cashier
('550e8400-e29b-41d4-a716-446655440054', 'cashier1', 'cashier@techmart.com', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'Mike Davis', 'cashier', true, '+1234567893'),
-- Additional Cashier
('550e8400-e29b-41d4-a716-446655440055', 'cashier2', 'cashier2@techmart.com', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'Lisa Wilson', 'cashier', true, '+1234567894'),
-- Demo Business Users
('550e8400-e29b-41d4-a716-446655440056', 'demo.admin', 'admin@demo.biz', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'Demo Admin', 'business_admin', true, '+1234567895'),
('550e8400-e29b-41d4-a716-446655440057', 'demo.manager', 'manager@demo.biz', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'Demo Manager', 'store_admin', true, '+1234567896'),
('550e8400-e29b-41d4-a716-446655440058', 'demo.cashier', 'cashier@demo.biz', '$2b$10$Cl2l6Cn7SnhH0ujUzl2/Ieot1ianitiL3SnEUNRnuoWOcq7HiGwuW', 'Demo Cashier', 'cashier', true, '+1234567897');

-- Insert Business
INSERT INTO public.business (id, name, description, industry, timezone, subscription_status, is_active, address, email, phone, website, subscription_plan_id, currency_id, language_id, country_id) VALUES
('550e8400-e29b-41d4-a716-446655440061', 'TechMart Electronics', 'Leading electronics retailer with cutting-edge technology products', 'Electronics & Technology', 'America/New_York', 'active', true, '123 Tech Street, Silicon Valley, CA 94025', 'info@techmart.com', '+1-555-0123', 'https://techmart.com', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440062', 'Demo Business', 'Demo business for testing and demonstration purposes', 'Demo & Testing', 'UTC', 'active', true, '456 Demo Street, Demo City, DC 12345', 'demo@biz.com', '+1-555-9999', 'https://demo.biz', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001');

-- Insert Store
INSERT INTO public.store (id, business_id, name, address, city, state, postal_code, phone, email, manager_name, is_active, currency_id, language_id, country_id) VALUES
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440061', 'TechMart Downtown', '456 Main Street, Downtown, CA 94025', 'Silicon Valley', 'CA', '94025', '+1-555-0124', 'downtown@techmart.com', 'Sarah Johnson', true, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440062', 'Demo Store', '789 Demo Avenue, Demo City, DC 12345', 'Demo City', 'DC', '12345', '+1-555-9998', 'store@demo.biz', 'Demo Manager', true, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001');

-- Note: User Business Roles will be inserted later in the file to avoid duplicates

-- Note: Roles will be inserted later in the file to avoid duplicates

-- Insert Business Settings
INSERT INTO public.business_setting (id, business_id, tax_rate, enable_tax, allow_returns, return_period_days, enable_sounds, logo_url, primary_color, secondary_color, accent_color, receipt_header, receipt_footer, return_policy, warranty_info) VALUES
('550e8400-e29b-41d4-a716-4466554400b1', '550e8400-e29b-41d4-a716-446655440061', 8.50, true, true, 30, true, 'https://storage.googleapis.com/scims-bucket/business-logos/techmart-logo.png', '#3B82F6', '#10B981', '#F59E0B', 'Thank you for shopping at TechMart Electronics!', 'Returns accepted within 30 days with receipt.', 'Returns accepted within 30 days with original receipt and packaging.', 'Standard manufacturer warranty applies. Extended warranty available.'),
('550e8400-e29b-41d4-a716-4466554400b2', '550e8400-e29b-41d4-a716-446655440062', 5.00, true, true, 14, true, 'https://storage.googleapis.com/scims-bucket/business-logos/demo-logo.png', '#6366F1', '#EC4899', '#F97316', 'Welcome to Demo Business!', 'Thank you for your demo purchase.', '14-day return policy for demo items.', 'Demo warranty applies.');

-- Insert Store Settings
INSERT INTO public.store_setting (id, store_id, tax_rate, enable_tax, allow_returns, return_period_days, enable_sounds, logo_url, primary_color, secondary_color, accent_color, receipt_header, receipt_footer, return_policy, contact_person, store_hours, store_promotion_info, custom_receipt_message) VALUES
('550e8400-e29b-41d4-a716-4466554400c1', '550e8400-e29b-41d4-a716-446655440071', 8.50, true, true, 30, true, 'https://storage.googleapis.com/scims-bucket/store-logos/techmart-downtown.png', '#3B82F6', '#10B981', '#F59E0B', 'TechMart Downtown - Your Tech Partner', 'Visit us online at techmart.com', '30-day return policy with receipt', 'Sarah Johnson', 'Mon-Fri: 9AM-9PM, Sat: 10AM-8PM, Sun: 11AM-6PM', 'Free gift wrapping on purchases over $100!', 'Thank you for choosing TechMart Downtown!'),
('550e8400-e29b-41d4-a716-4466554400c2', '550e8400-e29b-41d4-a716-446655440072', 5.00, true, true, 14, true, 'https://storage.googleapis.com/scims-bucket/store-logos/demo-store.png', '#6366F1', '#EC4899', '#F97316', 'Demo Store - Testing & Demonstration', 'Demo store for testing purposes', '14-day return policy for demo items', 'Demo Manager', 'Mon-Fri: 9AM-5PM, Sat: 10AM-4PM, Sun: Closed', 'Demo promotions available!', 'Thank you for testing our demo store!');

-- Insert Categories
INSERT INTO public.category (id, business_id, name, description, is_active, color) VALUES
('550e8400-e29b-41d4-a716-4466554400d1', '550e8400-e29b-41d4-a716-446655440061', 'Smartphones', 'Latest smartphones and mobile devices', true, '#3B82F6'),
('550e8400-e29b-41d4-a716-4466554400d2', '550e8400-e29b-41d4-a716-446655440061', 'Laptops', 'High-performance laptops and computers', true, '#10B981'),
('550e8400-e29b-41d4-a716-4466554400d3', '550e8400-e29b-41d4-a716-446655440061', 'Accessories', 'Phone cases, chargers, and tech accessories', true, '#F59E0B'),
('550e8400-e29b-41d4-a716-4466554400d4', '550e8400-e29b-41d4-a716-446655440061', 'Audio', 'Headphones, speakers, and audio equipment', true, '#8B5CF6'),
('550e8400-e29b-41d4-a716-4466554400d5', '550e8400-e29b-41d4-a716-446655440061', 'Gaming', 'Gaming consoles, games, and accessories', true, '#EF4444'),
('550e8400-e29b-41d4-a716-4466554400d6', '550e8400-e29b-41d4-a716-446655440062', 'Demo Category 1', 'First demo category for testing', true, '#6366F1'),
('550e8400-e29b-41d4-a716-4466554400d7', '550e8400-e29b-41d4-a716-446655440062', 'Demo Category 2', 'Second demo category for testing', true, '#EC4899');

-- Insert Brands
INSERT INTO public.brand (id, business_id, name, description, logo_url, website, contact_person, contact_email, contact_phone, is_active) VALUES
('550e8400-e29b-41d4-a716-4466554400e1', '550e8400-e29b-41d4-a716-446655440061', 'Apple', 'Think Different. Premium technology products.', 'https://storage.googleapis.com/scims-bucket/brand-logos/apple-logo.png', 'https://apple.com', 'Tim Cook', 'business@apple.com', '+1-800-275-2273', true),
('550e8400-e29b-41d4-a716-4466554400e2', '550e8400-e29b-41d4-a716-446655440061', 'Samsung', 'Innovation for Everyone', 'https://storage.googleapis.com/scims-bucket/brand-logos/samsung-logo.png', 'https://samsung.com', 'Kim Hyun-suk', 'business@samsung.com', '+1-800-726-7864', true),
('550e8400-e29b-41d4-a716-4466554400e3', '550e8400-e29b-41d4-a716-446655440061', 'Sony', 'Make.Believe', 'https://storage.googleapis.com/scims-bucket/brand-logos/sony-logo.png', 'https://sony.com', 'Kenichiro Yoshida', 'business@sony.com', '+1-800-222-7669', true),
('550e8400-e29b-41d4-a716-4466554400e4', '550e8400-e29b-41d4-a716-446655440061', 'Microsoft', 'Empowering every person and organization', 'https://storage.googleapis.com/scims-bucket/brand-logos/microsoft-logo.png', 'https://microsoft.com', 'Satya Nadella', 'business@microsoft.com', '+1-800-642-7676', true),
('550e8400-e29b-41d4-a716-4466554400e5', '550e8400-e29b-41d4-a716-446655440061', 'Nintendo', 'Creating smiles through entertainment', 'https://storage.googleapis.com/scims-bucket/brand-logos/nintendo-logo.png', 'https://nintendo.com', 'Shuntaro Furukawa', 'business@nintendo.com', '+1-800-255-3700', true);

-- Insert Suppliers
INSERT INTO public.supplier (id, business_id, name, contact_person, email, phone, address, is_active) VALUES
('550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440061', 'TechSupply Co.', 'David Wilson', 'orders@techsupply.com', '+1-555-1000', '789 Supply Street, Industrial District, CA 94025', true),
('550e8400-e29b-41d4-a716-4466554400f2', '550e8400-e29b-41d4-a716-446655440061', 'Global Electronics', 'Maria Garcia', 'sales@globalelectronics.com', '+1-555-1001', '321 Global Ave, Business Park, CA 94025', true),
('550e8400-e29b-41d4-a716-4466554400f3', '550e8400-e29b-41d4-a716-446655440061', 'Premium Tech', 'Robert Chen', 'orders@premiumtech.com', '+1-555-1002', '654 Premium Blvd, Tech Valley, CA 94025', true);

-- Insert Products
INSERT INTO public.product (id, store_id, category_id, supplier_id, business_id, name, description, sku, barcode, price, cost, stock_quantity, min_stock_level, max_stock_level, brand_id, image_url, is_active, reorder_level) VALUES
-- Smartphones
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d1', '550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440061', 'iPhone 15 Pro', 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system', 'IPH15PRO-128', '190199267471', 999.00, 750.00, 25, 5, 100, '550e8400-e29b-41d4-a716-4466554400e1', 'https://storage.googleapis.com/scims-bucket/products/iphone-15-pro.png', true, 10),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d1', '550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440061', 'Samsung Galaxy S24 Ultra', 'Premium Android flagship with S Pen, 200MP camera, and AI features', 'SAMS24ULT-256', '880609222845', 1199.00, 900.00, 20, 5, 80, '550e8400-e29b-41d4-a716-4466554400e2', 'https://storage.googleapis.com/scims-bucket/products/samsung-galaxy-s24-ultra.png', true, 8),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d1', '550e8400-e29b-41d4-a716-4466554400f2', '550e8400-e29b-41d4-a716-446655440061', 'Google Pixel 8 Pro', 'AI-powered camera system with advanced photo editing capabilities', 'GPIX8PRO-128', '842776108242', 899.00, 675.00, 15, 3, 60, '550e8400-e29b-41d4-a716-4466554400e3', 'https://storage.googleapis.com/scims-bucket/products/google-pixel-8-pro.png', true, 6),

-- Laptops
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d2', '550e8400-e29b-41d4-a716-4466554400f2', '550e8400-e29b-41d4-a716-446655440061', 'MacBook Pro 16" M3', '16-inch MacBook Pro with M3 chip, perfect for professionals', 'MBP16M3-512', '190199267472', 2499.00, 1875.00, 12, 3, 50, '550e8400-e29b-41d4-a716-4466554400e1', 'https://storage.googleapis.com/scims-bucket/products/macbook-pro-16-m3.png', true, 5),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d2', '550e8400-e29b-41d4-a716-4466554400f3', '550e8400-e29b-41d4-a716-446655440061', 'Dell XPS 15', 'Premium Windows laptop with 4K display and RTX graphics', 'DELLXPS15-1TB', '884116123456', 1899.00, 1425.00, 8, 2, 40, '550e8400-e29b-41d4-a716-4466554400e4', 'https://storage.googleapis.com/scims-bucket/products/dell-xps-15.png', true, 4),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d2', '550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440061', 'Lenovo ThinkPad X1', 'Business-class laptop with premium build quality', 'LENX1-512', '884116123457', 1599.00, 1200.00, 10, 3, 45, '550e8400-e29b-41d4-a716-4466554400e4', 'https://storage.googleapis.com/scims-bucket/products/lenovo-thinkpad-x1.png', true, 5),

-- Accessories
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d3', '550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440061', 'iPhone 15 Pro Case', 'Premium leather case with MagSafe compatibility', 'IPHCASE15PRO', '190199267473', 49.99, 25.00, 50, 10, 200, '550e8400-e29b-41d4-a716-4466554400e1', 'https://storage.googleapis.com/scims-bucket/products/iphone-15-pro-case.png', true, 15),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d3', '550e8400-e29b-41d4-a716-4466554400f2', '550e8400-e29b-41d4-a716-446655440061', 'Samsung 25W Charger', 'Fast charging adapter for Samsung devices', 'SAMSCHG25W', '880609222846', 29.99, 15.00, 75, 15, 300, '550e8400-e29b-41d4-a716-4466554400e2', 'https://storage.googleapis.com/scims-bucket/products/samsung-25w-charger.png', true, 20),
('550e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d3', '550e8400-e29b-41d4-a716-4466554400f3', '550e8400-e29b-41d4-a716-446655440061', 'USB-C Cable Pack', 'High-quality USB-C cables in various lengths', 'USBCABLE-PACK', '842776108243', 19.99, 8.00, 100, 20, 400, '550e8400-e29b-41d4-a716-4466554400e3', 'https://storage.googleapis.com/scims-bucket/products/usb-c-cable-pack.png', true, 25),

-- Audio
('550e8400-e29b-41d4-a716-44665544010a', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d4', '550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440061', 'AirPods Pro 2', 'Active noise cancellation with spatial audio', 'AIRPODSPRO2', '190199267474', 249.00, 175.00, 30, 8, 120, '550e8400-e29b-41d4-a716-4466554400e1', 'https://storage.googleapis.com/scims-bucket/products/airpods-pro-2.png', true, 12),
('550e8400-e29b-41d4-a716-44665544010b', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d4', '550e8400-e29b-41d4-a716-4466554400f2', '550e8400-e29b-41d4-a716-446655440061', 'Sony WH-1000XM5', 'Industry-leading noise cancellation headphones', 'SONYWH1000XM5', '880609222847', 399.00, 280.00, 18, 5, 80, '550e8400-e29b-41d4-a716-4466554400e3', 'https://storage.googleapis.com/scims-bucket/products/sony-wh-1000xm5.png', true, 8),
('550e8400-e29b-41d4-a716-44665544010c', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d4', '550e8400-e29b-41d4-a716-4466554400f3', '550e8400-e29b-41d4-a716-446655440061', 'JBL Flip 6', 'Portable Bluetooth speaker with waterproof design', 'JBLFLIP6', '842776108244', 129.99, 78.00, 25, 5, 100, '550e8400-e29b-41d4-a716-4466554400e3', 'https://storage.googleapis.com/scims-bucket/products/jbl-flip-6.png', true, 10),

-- Gaming
('550e8400-e29b-41d4-a716-44665544010d', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d5', '550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440061', 'Nintendo Switch OLED', 'Enhanced Switch with 7-inch OLED screen', 'NINSWITCHOLED', '190199267475', 349.99, 245.00, 15, 5, 60, '550e8400-e29b-41d4-a716-4466554400e5', 'https://storage.googleapis.com/scims-bucket/products/nintendo-switch-oled.png', true, 8),
('550e8400-e29b-41d4-a716-44665544010e', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d5', '550e8400-e29b-41d4-a716-4466554400f2', '550e8400-e29b-41d4-a716-446655440061', 'PlayStation 5', 'Next-gen gaming console with lightning-fast loading', 'PS5-DISC', '880609222848', 499.99, 350.00, 8, 3, 40, '550e8400-e29b-41d4-a716-4466554400e3', 'https://storage.googleapis.com/scims-bucket/products/playstation-5.png', true, 5),
('550e8400-e29b-41d4-a716-44665544010f', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400d5', '550e8400-e29b-41d4-a716-4466554400f3', '550e8400-e29b-41d4-a716-446655440061', 'Xbox Series X', 'Most powerful Xbox ever with 4K gaming', 'XBOXSERIESX', '842776108245', 499.99, 350.00, 6, 2, 35, '550e8400-e29b-41d4-a716-4466554400e4', 'https://storage.googleapis.com/scims-bucket/products/xbox-series-x.png', true, 4);

-- Demo Products
INSERT INTO public.product (id, store_id, category_id, supplier_id, business_id, name, description, sku, barcode, price, cost, stock_quantity, min_stock_level, max_stock_level, brand_id, image_url, is_active, reorder_level) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-4466554400d6', '550e8400-e29b-41d4-a716-4466554400f1', '550e8400-e29b-41d4-a716-446655440062', 'Demo Product 1', 'First demo product for testing purposes', 'DEMO1-001', '123456789001', 19.99, 10.00, 50, 5, 200, null, 'https://storage.googleapis.com/scims-bucket/products/demo-product-1.png', true, 10),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-4466554400d6', '550e8400-e29b-41d4-a716-4466554400f2', '550e8400-e29b-41d4-a716-446655440062', 'Demo Product 2', 'Second demo product for testing purposes', 'DEMO2-002', '123456789002', 29.99, 15.00, 30, 3, 150, null, 'https://storage.googleapis.com/scims-bucket/products/demo-product-2.png', true, 8),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-4466554400d7', '550e8400-e29b-41d4-a716-4466554400f3', '550e8400-e29b-41d4-a716-446655440062', 'Demo Product 3', 'Third demo product for testing purposes', 'DEMO3-003', '123456789003', 39.99, 20.00, 25, 2, 100, null, 'https://storage.googleapis.com/scims-bucket/products/demo-product-3.png', true, 5);

-- Insert Customers
INSERT INTO public.customer (id, store_id, name, email, phone, address, total_purchases, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440071', 'Alice Johnson', 'alice.johnson@email.com', '+1-555-2001', '123 Customer Street, Downtown, CA 94025', 0.00, true),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440071', 'Bob Smith', 'bob.smith@email.com', '+1-555-2002', '456 Customer Ave, Downtown, CA 94025', 0.00, true),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440071', 'Carol Davis', 'carol.davis@email.com', '+1-555-2003', '789 Customer Blvd, Downtown, CA 94025', 0.00, true),
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440071', 'David Wilson', 'david.wilson@email.com', '+1-555-2004', '321 Customer Lane, Downtown, CA 94025', 0.00, true),
('550e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440071', 'Emma Brown', 'emma.brown@email.com', '+1-555-2005', '654 Customer Road, Downtown, CA 94025', 0.00, true),
('550e8400-e29b-41d4-a716-446655440116', '550e8400-e29b-41d4-a716-446655440072', 'Demo Customer 1', 'demo1@test.com', '+1-555-3001', '123 Demo Street, Demo City, DC 12345', 0.00, true),
('550e8400-e29b-41d4-a716-446655440117', '550e8400-e29b-41d4-a716-446655440072', 'Demo Customer 2', 'demo2@test.com', '+1-555-3002', '456 Demo Avenue, Demo City, DC 12345', 0.00, true);

-- Note: Permissions are now stored as JSONB arrays in role.permissions
-- No separate permissions table is needed

-- Note: Platform Analytics will be inserted later in the file to avoid duplicates

-- Note: Platform Revenue will be inserted later in the file to avoid duplicates

-- Insert Roles
INSERT INTO public.role (id, business_id, name, description, permissions, is_system_role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440141', '550e8400-e29b-41d4-a716-446655440061', 'Super Admin', 'Full system access with all permissions', '["*"]', true, true),
('550e8400-e29b-41d4-a716-446655440142', '550e8400-e29b-41d4-a716-446655440061', 'Business Admin', 'Business management with store oversight', '["business.*", "store.*", "product.*", "user.*", "sale.*", "report.*", "setting.*"]', true, true),
('550e8400-e29b-41d4-a716-446655440143', '550e8400-e29b-41d4-a716-446655440061', 'Store Admin', 'Store management with limited business access', '["store.view", "product.*", "sale.*", "user.view", "report.view"]', true, true),
('550e8400-e29b-41d4-a716-446655440144', '550e8400-e29b-41d4-a716-446655440061', 'Cashier', 'Sales processing and basic operations', '["sale.create", "sale.view", "product.view", "customer.view", "customer.create"]', true, true),
('550e8400-e29b-41d4-a716-446655440145', '550e8400-e29b-41d4-a716-446655440062', 'Business Admin', 'Demo business management with store oversight', '["business.*", "store.*", "product.*", "user.*", "sale.*", "report.*", "setting.*"]', true, true),
('550e8400-e29b-41d4-a716-446655440146', '550e8400-e29b-41d4-a716-446655440062', 'Store Admin', 'Demo store management with limited business access', '["store.view", "product.*", "sale.*", "user.view", "report.view"]', true, true),
('550e8400-e29b-41d4-a716-446655440147', '550e8400-e29b-41d4-a716-446655440062', 'Cashier', 'Demo sales processing and basic operations', '["sale.create", "sale.view", "product.view", "customer.view", "customer.create"]', true, true);

-- Insert User Business Roles
INSERT INTO public.user_business_role (id, user_id, business_id, store_id) VALUES
('550e8400-e29b-41d4-a716-446655440151', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440061', null),
('550e8400-e29b-41d4-a716-446655440152', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440061', null),
('550e8400-e29b-41d4-a716-446655440153', '550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440071'),
('550e8400-e29b-41d4-a716-446655440154', '550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440071'),
('550e8400-e29b-41d4-a716-446655440155', '550e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440062', null),
('550e8400-e29b-41d4-a716-446655440156', '550e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440072'),
('550e8400-e29b-41d4-a716-446655440157', '550e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440072');

-- Insert User Roles
INSERT INTO public.user_role (id, user_id, role_id, business_id, store_id, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440161', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440141', '550e8400-e29b-41d4-a716-446655440061', null, true),
('550e8400-e29b-41d4-a716-446655440162', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440142', '550e8400-e29b-41d4-a716-446655440061', null, true),
('550e8400-e29b-41d4-a716-446655440163', '550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440143', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440071', true),
('550e8400-e29b-41d4-a716-446655440164', '550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440144', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440071', true),
('550e8400-e29b-41d4-a716-446655440165', '550e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440142', '550e8400-e29b-41d4-a716-446655440062', null, true),
('550e8400-e29b-41d4-a716-446655440166', '550e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440143', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440072', true),
('550e8400-e29b-41d4-a716-446655440167', '550e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440144', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440072', true);

-- Note: Subscription Distribution will be inserted later in the file to avoid duplicates

-- Insert Activity Logs (sample activities)
INSERT INTO public.activity_log (id, user_id, business_id, store_id, activity_type, category, description, metadata, ip_address, user_agent) VALUES
('550e8400-e29b-41d4-a716-446655440181', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440061', null, 'login', 'Authentication', 'User logged in successfully', '{"ip": "192.168.1.100", "device": "desktop"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('550e8400-e29b-41d4-a716-446655440182', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440061', null, 'product_create', 'Product Management', 'Created new product: iPhone 15 Pro', '{"product_id": "550e8400-e29b-41d4-a716-446655440101", "product_name": "iPhone 15 Pro"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('550e8400-e29b-41d4-a716-446655440183', '550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440071', 'sale_create', 'Sales', 'Created new sale transaction', '{"sale_id": "550e8400-e29b-41d4-a716-446655440191", "amount": 999.00}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('550e8400-e29b-41d4-a716-446655440184', '550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440071', 'customer_create', 'Customer Management', 'Added new customer: Alice Johnson', '{"customer_id": "550e8400-e29b-41d4-a716-446655440111", "customer_name": "Alice Johnson"}', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15');

-- Insert Sample Sales (minimal for demonstration)
INSERT INTO public.sale (id, store_id, cashier_id, customer_id, receipt_number, subtotal, tax_amount, total_amount, payment_method, cash_received, change_given, status, notes, transaction_date) VALUES
('550e8400-e29b-41d4-a716-446655440191', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440111', 'RCP-001-2024', 999.00, 84.92, 1083.92, 'card', null, null, 'completed', 'First sale of the day', CURRENT_DATE - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440192', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440112', 'RCP-002-2024', 1299.00, 110.42, 1409.42, 'cash', 1500.00, 90.58, 'completed', 'Cash payment with change', CURRENT_DATE - INTERVAL '1 day');

-- Insert Sample Sale Items
INSERT INTO public.sale_item (id, sale_id, product_id, quantity, unit_price, total_price, discount_amount) VALUES
('550e8400-e29b-41d4-a716-4466554401a1', '550e8400-e29b-41d4-a716-446655440191', '550e8400-e29b-41d4-a716-446655440101', 1, 999.00, 999.00, 0.00),
('550e8400-e29b-41d4-a716-4466554401a2', '550e8400-e29b-41d4-a716-446655440192', '550e8400-e29b-41d4-a716-446655440102', 1, 1199.00, 1199.00, 0.00),
('550e8400-e29b-41d4-a716-4466554401a3', '550e8400-e29b-41d4-a716-446655440192', '550e8400-e29b-41d4-a716-446655440107', 1, 49.99, 49.99, 0.00);

-- Insert Sample Restock Orders
INSERT INTO public.restock_order (id, store_id, supplier_id, status, notes, created_by, total_amount, expected_delivery) VALUES
('550e8400-e29b-41d4-a716-4466554401b1', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400f1', 'ordered', 'Monthly restock order for popular items', '550e8400-e29b-41d4-a716-446655440053', 5000.00, CURRENT_DATE + INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-4466554401b2', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-4466554400f2', 'pending', 'New product line restock', '550e8400-e29b-41d4-a716-446655440053', 3000.00, CURRENT_DATE + INTERVAL '14 days');

-- Insert Sample Restock Items
INSERT INTO public.restock_item (id, restock_order_id, product_id, quantity, unit_cost, total_cost) VALUES
('550e8400-e29b-41d4-a716-4466554401c1', '550e8400-e29b-41d4-a716-4466554401b1', '550e8400-e29b-41d4-a716-446655440101', 20, 750.00, 15000.00),
('550e8400-e29b-41d4-a716-4466554401c2', '550e8400-e29b-41d4-a716-4466554401b1', '550e8400-e29b-41d4-a716-446655440102', 15, 900.00, 13500.00),
('550e8400-e29b-41d4-a716-4466554401c3', '550e8400-e29b-41d4-a716-4466554401b2', '550e8400-e29b-41d4-a716-446655440104', 8, 1875.00, 15000.00);

-- Insert Sample Saved Carts
INSERT INTO public.saved_cart (id, store_id, cashier_id, customer_id, cart_name, cart_data) VALUES
('550e8400-e29b-41d4-a716-4466554401d1', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440111', 'Alice Shopping Cart', '{"items": [{"product_id": "550e8400-e29b-41d4-a716-44665544010a", "quantity": 1, "price": 249.00}, {"product_id": "550e8400-e29b-41d4-a716-446655440107", "quantity": 1, "price": 49.99}], "total": 298.99}'),
('550e8400-e29b-41d4-a716-4466554401d2', '550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440112', 'Bob Wishlist', '{"items": [{"product_id": "550e8400-e29b-41d4-a716-446655440104", "quantity": 1, "price": 2499.00}], "total": 2499.00}');

-- Update customer total purchases based on sales
UPDATE public.customer 
SET total_purchases = (
    SELECT COALESCE(SUM(si.total_price), 0)
    FROM sale s
    JOIN sale_item si ON s.id = si.sale_id
    WHERE s.customer_id = customer.id
),
last_purchase_at = (
    SELECT MAX(s.transaction_date)
    FROM sale s
    WHERE s.customer_id = customer.id
);

-- Update product total sold and revenue based on sales
UPDATE public.product 
SET total_sold = (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_item si
    JOIN sale s ON si.sale_id = s.id
    WHERE si.product_id = product.id
),
total_revenue = (
    SELECT COALESCE(SUM(si.total_price), 0)
    FROM sale_item si
    JOIN sale s ON si.sale_id = s.id
    WHERE si.product_id = product.id
);

-- Insert additional platform analytics for more comprehensive data
INSERT INTO public.platform_analytic (id, date, new_users, active_users, new_businesses, active_businesses, total_transactions, total_revenue) VALUES
('550e8400-e29b-41d4-a716-446655440124', CURRENT_DATE - INTERVAL '27 days', 14, 44, 2, 8, 165, 13800.00),
('550e8400-e29b-41d4-a716-446655440125', CURRENT_DATE - INTERVAL '26 days', 16, 46, 1, 7, 189, 16200.00),
('550e8400-e29b-41d4-a716-446655440126', CURRENT_DATE - INTERVAL '25 days', 13, 43, 2, 8, 172, 14500.00),
('550e8400-e29b-41d4-a716-446655440127', CURRENT_DATE - INTERVAL '24 days', 17, 47, 3, 9, 195, 16800.00),
('550e8400-e29b-41d4-a716-446655440128', CURRENT_DATE - INTERVAL '23 days', 15, 45, 1, 7, 183, 15800.00);

-- Insert additional platform revenue data
INSERT INTO public.platform_revenue (id, date, revenue, subscription_revenue, transaction_fees, other_revenue) VALUES
('550e8400-e29b-41d4-a716-446655440134', CURRENT_DATE - INTERVAL '27 days', 13800.00, 12200.00, 1300.00, 300.00),
('550e8400-e29b-41d4-a716-446655440135', CURRENT_DATE - INTERVAL '26 days', 16200.00, 14500.00, 1500.00, 200.00),
('550e8400-e29b-41d4-a716-446655440136', CURRENT_DATE - INTERVAL '25 days', 14500.00, 12800.00, 1400.00, 300.00),
('550e8400-e29b-41d4-a716-446655440137', CURRENT_DATE - INTERVAL '24 days', 16800.00, 15000.00, 1600.00, 200.00),
('550e8400-e29b-41d4-a716-446655440138', CURRENT_DATE - INTERVAL '23 days', 15800.00, 14000.00, 1500.00, 300.00);

-- Insert additional subscription distribution data
INSERT INTO public.subscription_distribution (id, plan_name, subscriber_count, revenue, recorded_date) VALUES
('550e8400-e29b-41d4-a716-446655440174', 'Starter', 12, 359.88, CURRENT_DATE - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440175', 'Professional', 6, 479.94, CURRENT_DATE - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440176', 'Enterprise', 2, 399.98, CURRENT_DATE - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440177', 'Starter', 18, 539.82, CURRENT_DATE - INTERVAL '14 days'),
('550e8400-e29b-41d4-a716-446655440178', 'Professional', 10, 799.90, CURRENT_DATE - INTERVAL '14 days'),
('550e8400-e29b-41d4-a716-446655440179', 'Enterprise', 4, 799.96, CURRENT_DATE - INTERVAL '14 days');

-- Sample data insertion complete
-- This provides a comprehensive foundation for the SCIMS application with:
-- - Users (superadmin, business admin, store admin, cashier)
-- - Business and store setup
-- - Categories and brands
-- - Realistic products with images
-- - Suppliers and customers
-- - Sample sales and activity logs
-- - Platform analytics and revenue data
-- - Proper relationships and constraints maintained