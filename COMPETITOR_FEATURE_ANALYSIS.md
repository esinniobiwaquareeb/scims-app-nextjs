# Competitor Feature Analysis: Amante Report vs SCIMS

This document compares Amante Report's features with SCIMS's current implementation and identifies gaps and enhancement opportunities.

## ✅ Features SCIMS Already Has

### Sales
- ✅ Basic sales creation and processing
- ✅ Payment methods: Cash, Card, Mobile, Other
- ✅ Mixed payment support (cash + card)
- ✅ Receipt printing
- ✅ Sales status tracking (pending, completed, refunded, cancelled)
- ✅ Discount system (coupons and promotions)
- ✅ Tax calculation
- ✅ Customer assignment to sales

### POS
- ✅ Point of Sale interface
- ✅ Product selection and cart management
- ✅ Price editing capability
- ✅ Tax and discount application
- ✅ Barcode scanning support
- ✅ Customer selection

### Products
- ✅ Product creation with SKU and barcode
- ✅ Product categories, brands, suppliers
- ✅ Stock quantity tracking
- ✅ Product images
- ✅ Date created tracking (via `created_at`)

### Inventory
- ✅ Stock quantity management
- ✅ Low stock alerts
- ✅ Restock orders
- ✅ Stock history (via activity logs)

### Reports
- ✅ Sales reports
- ✅ Dashboard analytics
- ✅ Product performance tracking

---

## ❌ Missing Features (High Priority)

### 1. Sales Management Enhancements

#### 1.1 Edit Completed Sales
- **Status**: ❌ Not Implemented
- **Requirement**: Completed sales should be editable to add more items
- **Impact**: High - Important for customer service
- **Implementation Notes**:
  - Need to allow editing `completed` sales
  - Add items to existing sale
  - Recalculate totals
  - Update stock accordingly
  - Maintain audit trail

#### 1.2 Sale Return Functionality
- **Status**: ❌ Not Implemented (Exchange system exists but not direct returns)
- **Requirement**: Action button to create sale return for completed sales
- **Impact**: High - Essential for retail operations
- **Implementation Notes**:
  - Create return transaction linked to original sale
  - Restore stock quantities
  - Handle partial returns
  - Refund processing

#### 1.3 Delete Sales
- **Status**: ❌ Not Implemented
- **Requirement**: Ability to delete sales (with proper permissions)
- **Impact**: Medium - Needed for error correction
- **Implementation Notes**:
  - Restore stock on deletion
  - Only allow for recent sales (e.g., same day)
  - Require admin/store_manager permissions
  - Maintain audit log

#### 1.4 Backdate Sales
- **Status**: ❌ Not Implemented
- **Requirement**: Sales date can be backdated
- **Impact**: Medium - Needed for correcting mistakes
- **Implementation Notes**:
  - Allow editing `transaction_date` field
  - Validate date is not in future
  - Require appropriate permissions
  - Update reports accordingly

#### 1.5 Partial/Fully Paid Status
- **Status**: ⚠️ Partially Implemented
- **Current**: `payment_status` field exists but not fully utilized
- **Requirement**: Track partial payments vs fully paid
- **Impact**: High - Important for credit sales
- **Implementation Notes**:
  - Enhance `payment_status` enum: 'pending', 'partial', 'fully_paid', 'overdue'
  - Track payment amounts vs total
  - Payment history tracking
  - UI indicators for payment status

#### 1.6 Delivery Cost
- **Status**: ❌ Not Implemented
- **Requirement**: Optional delivery cost field
- **Impact**: Medium - Needed for delivery orders
- **Implementation Notes**:
  - Add `delivery_cost` field to `sale` table
  - Include in total calculation
  - Toggle option in POS

#### 1.7 Cross-Store Order Selection
- **Status**: ❌ Not Implemented
- **Requirement**: Select orders across stores and edit prices before processing
- **Impact**: Medium - Useful for multi-store businesses
- **Implementation Notes**:
  - Allow selecting products from multiple stores
  - Price override capability
  - Transfer handling

### 2. POS Enhancements

#### 2.1 Edit Prices After Order Selection
- **Status**: ⚠️ Partially Implemented
- **Current**: Prices can be edited in cart
- **Requirement**: More prominent edit button after selecting orders
- **Impact**: Low - Mostly UI/UX improvement

#### 2.2 Cross-Store Product Selection
- **Status**: ❌ Not Implemented
- **Requirement**: Select products from multiple stores in POS
- **Impact**: Medium - Useful for multi-store operations
- **Implementation Notes**:
  - Store selector in POS
  - Product fetching from multiple stores
  - Stock validation per store

#### 2.3 Recent Sales Filter
- **Status**: ⚠️ Partially Implemented
- **Current**: Recent sales exist but may not show all sales before present day
- **Requirement**: Show all sales before present day in recent sales
- **Impact**: Low - Clarification needed on exact requirement

### 3. Quotation System

#### 3.1 Quotation Management
- **Status**: ❌ Not Implemented
- **Requirement**: Complete quotation system
- **Impact**: High - Important for B2B and custom orders
- **Features Needed**:
  - Create quotations with order details
  - Tax and discount application
  - Bank account information
  - Email/phone for sending
  - Quotation status tracking
  - Field for items not in company store
  - Search functionality
  - Action buttons: email, edit, delete, print
  - List of all sent quotations

**Implementation Notes**:
- Create `quotation` table
- Create `quotation_item` table
- Quotation status: 'draft', 'sent', 'accepted', 'rejected', 'expired'
- Email integration for sending
- PDF generation for printing
- Convert quotation to sale/order

### 4. Product Enhancements

#### 4.1 Auto-Generated Unique Code
- **Status**: ⚠️ Partially Implemented
- **Current**: SKU and barcode fields exist but not auto-generated
- **Requirement**: Auto-generate unique code on product creation
- **Impact**: Medium - Improves data consistency
- **Implementation Notes**:
  - Generate unique code if not provided
  - Format: `PRD-{timestamp}-{random}` or sequential
  - Ensure uniqueness per business/store

#### 4.2 Product Units
- **Status**: ❌ Not Implemented
- **Requirement**: Support for units (packets, dozen, etc.)
- **Impact**: Medium - Important for inventory accuracy
- **Implementation Notes**:
  - Add `unit` field to product table
  - Unit types: 'piece', 'packet', 'dozen', 'box', 'kg', 'liter', etc.
  - Unit conversion support
  - Display in POS and reports

### 5. Price Adjustment

#### 5.1 Bulk Price Adjustment by Category
- **Status**: ❌ Not Implemented
- **Requirement**: Adjust prices by category with percentage increase/decrease
- **Impact**: High - Saves time for price updates
- **Implementation Notes**:
  - Bulk price adjustment interface
  - Select category
  - Apply percentage change
  - Preview before applying
  - Audit log

### 6. Stock Adjustment

#### 6.1 Stock Adjustment System
- **Status**: ❌ Not Implemented
- **Requirement**: Rectify stock discrepancies with date and reason
- **Impact**: High - Essential for inventory accuracy
- **Implementation Notes**:
  - Create `stock_adjustment` table
  - Fields: product_id, store_id, quantity_change, reason, adjustment_date, created_by
  - Edit and delete actions (Store manager and admin only)
  - Audit trail
  - Stock history tracking

### 7. Stock Transfer

#### 7.1 Inter-Store Stock Transfer
- **Status**: ❌ Not Implemented
- **Requirement**: Move products from one store to another
- **Impact**: High - Essential for multi-store operations
- **Implementation Notes**:
  - Create `stock_transfer` table
  - Fields: from_store_id, to_store_id, product_id, quantity, transfer_date, status, notes
  - Status: 'pending', 'in_transit', 'completed', 'cancelled'
  - Permission: Store manager and admin only
  - Update stock on both stores
  - Transfer history

### 8. Restock Enhancements

#### 8.1 Return to Supplier
- **Status**: ⚠️ Partially Implemented (supply-returns exists but may need enhancement)
- **Current**: Supply returns system exists
- **Requirement**: Return tab in restock management
- **Impact**: Medium - Better organization
- **Implementation Notes**:
  - Enhance restock UI with return tab
  - Link to existing supply-returns functionality
  - Better integration with restock orders

### 9. Financial Expenses

#### 9.1 Expense Tracking
- **Status**: ❌ Not Implemented
- **Requirement**: Track financial expenses
- **Impact**: Medium - Useful for financial management
- **Implementation Notes**:
  - Create `expense` table
  - Fields: business_id, store_id, category, amount, description, date, created_by
  - Expense categories
  - Reports integration

### 10. Stock Inventory Reports

#### 10.1 Stock History Actions
- **Status**: ⚠️ Partially Implemented
- **Current**: Activity logs track stock changes
- **Requirement**: Action buttons in stock history (qty sold, transfer)
- **Impact**: Medium - Better usability
- **Implementation Notes**:
  - Enhance stock history view
  - Add action buttons for common operations
  - Link to sales/transfers

#### 10.2 Stock Summary Report
- **Status**: ⚠️ Partially Implemented
- **Current**: Basic stock reports exist
- **Requirement**: Generate stock report for transfers and qty sold with product dropdown
- **Impact**: Medium - Better reporting
- **Implementation Notes**:
  - Enhanced stock summary report
  - Filter by product
  - Show transfers and sales
  - Export functionality

### 11. Enhanced Reports

#### 11.1 Top-Selling Products Report
- **Status**: ⚠️ Partially Implemented
- **Current**: Product performance exists in dashboard
- **Requirement**: Dedicated top-selling products report
- **Impact**: Medium - Better insights
- **Implementation Notes**:
  - Dedicated report page
  - Filter by date range, store, category
  - Sort by quantity/revenue
  - Export options

#### 11.2 Top-Selling Brands Report
- **Status**: ❌ Not Implemented
- **Requirement**: Report for top-selling brands
- **Impact**: Low - Nice to have
- **Implementation Notes**:
  - Aggregate sales by brand
  - Similar to product report

#### 11.3 Purchase Reports
- **Status**: ⚠️ Partially Implemented
- **Current**: Restock orders exist
- **Requirement**: Generate purchase reports
- **Impact**: Medium - Financial tracking
- **Implementation Notes**:
  - Report on restock orders
  - Supplier spending analysis
  - Purchase trends

#### 11.4 Supplier Reports
- **Status**: ❌ Not Implemented
- **Requirement**: Track debt and purchases per supplier
- **Impact**: High - Important for supplier management
- **Implementation Notes**:
  - Supplier debt tracking
  - Purchase history per supplier
  - Payment tracking
  - Outstanding balance

### 12. Business Settings

#### 12.1 Bank Account Field
- **Status**: ❌ Not Implemented
- **Requirement**: Add bank account information
- **Impact**: Medium - Needed for quotations and payments
- **Implementation Notes**:
  - Add bank account fields to business/store settings
  - Multiple accounts support
  - Display in quotations

#### 12.2 Staff Profile Editing
- **Status**: ⚠️ Needs Clarification
- **Current**: Staff management exists
- **Requirement**: Staff able to edit profile or only admin
- **Impact**: Low - Permission configuration
- **Implementation Notes**:
  - Add profile editing capability
  - Permission-based access
  - Self-service vs admin-only

---

## 📊 Priority Matrix

### Critical (Implement First)
1. **Sale Return Functionality** - Essential for retail
2. **Quotation System** - Important for B2B
3. **Stock Adjustment System** - Critical for inventory accuracy
4. **Stock Transfer** - Essential for multi-store
5. **Partial/Fully Paid Status** - Important for credit sales

### High Priority
6. **Edit Completed Sales** - Customer service
7. **Bulk Price Adjustment by Category** - Time saver
8. **Supplier Reports with Debt Tracking** - Financial management
9. **Product Units Support** - Inventory accuracy
10. **Auto-Generated Product Codes** - Data consistency

### Medium Priority
11. **Delivery Cost** - Useful feature
12. **Cross-Store Order Selection** - Multi-store operations
13. **Financial Expenses** - Business management
14. **Enhanced Stock Reports** - Better insights
15. **Bank Account Field** - Quotation support

### Low Priority
16. **Delete Sales** - Error correction
17. **Backdate Sales** - Correction feature
18. **Recent Sales Filter Enhancement** - UI improvement
19. **Top-Selling Brands Report** - Analytics
20. **Staff Profile Editing Permissions** - Configuration

---

## 🗄️ Database Schema Changes Needed

### New Tables Required

1. **quotation**
   - id, business_id, store_id, customer_id, quotation_number, status, subtotal, tax_amount, discount_amount, total_amount, bank_account_info, email, phone, notes, created_by, created_at, updated_at, expires_at

2. **quotation_item**
   - id, quotation_id, product_id (nullable), item_name, description, quantity, unit_price, total_price, is_custom_item

3. **stock_adjustment**
   - id, store_id, product_id, quantity_change, reason, adjustment_date, created_by, created_at, updated_at

4. **stock_transfer**
   - id, from_store_id, to_store_id, product_id, quantity, transfer_date, status, notes, created_by, created_at, updated_at

5. **expense**
   - id, business_id, store_id, category, amount, description, expense_date, created_by, created_at, updated_at

### Schema Modifications

1. **sale table**
   - Add: `delivery_cost` (numeric)
   - Modify: `payment_status` enum to include 'partial', 'fully_paid', 'overdue'
   - Add: `is_editable` (boolean) or remove restriction on editing completed sales

2. **product table**
   - Add: `unit` (varchar) - unit type
   - Add: `auto_generated_code` (varchar) - if auto-generated

3. **business_setting / store_setting**
   - Add: `bank_accounts` (jsonb) - array of bank account info

4. **restock_order**
   - Enhance: Link to return functionality (may already exist via supply-returns)

---

## 🚀 Implementation Roadmap

### Phase 1: Critical Features (Weeks 1-4)
1. Sale Return Functionality
2. Stock Adjustment System
3. Stock Transfer
4. Partial/Fully Paid Status Enhancement

### Phase 2: High Priority (Weeks 5-8)
5. Quotation System
6. Bulk Price Adjustment
7. Supplier Reports with Debt Tracking
8. Product Units Support

### Phase 3: Medium Priority (Weeks 9-12)
9. Edit Completed Sales
10. Delivery Cost
11. Financial Expenses
12. Enhanced Reports
13. Bank Account Field

### Phase 4: Polish & Enhancements (Weeks 13-16)
14. Auto-Generated Product Codes
15. Cross-Store Features
16. UI/UX Improvements
17. Remaining Low Priority Items

---

## 📝 Notes

- Some features may already exist in different forms (e.g., exchange system vs returns)
- Need to review existing codebase more thoroughly for partial implementations
- Consider user feedback and business priorities when finalizing implementation order
- Some features may require UI/UX redesigns
- Database migrations needed for schema changes
- API routes need to be created/updated for new features

---

## 🔍 Areas Needing Further Investigation

1. **Exchange vs Return**: Review if exchange system can be adapted for returns
2. **Supply Returns**: Check if existing supply-returns meets restock return requirements
3. **Activity Logs**: Review if they can be enhanced for stock history actions
4. **Payment Status**: Check current implementation of payment_status field
5. **Recent Sales**: Clarify exact requirement for "recent sales before present day"

