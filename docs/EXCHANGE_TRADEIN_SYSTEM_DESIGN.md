# Exchange/Trade-in System - QA Testing Guide

## Overview
The Exchange/Trade-in system allows stores to handle:
1. **Customer Returns** - Items purchased from the store that customers want to return
2. **Trade-ins** - Customers bringing items (not purchased from store) to trade for new items
3. **Exchanges** - Combination of return + new purchase

## Access Points
- **POS System**: Click "Exchange/Trade-in" button in POS header
- **Navigation Menu**: Sales → Exchange & Trade-in (for business_admin, store_admin, cashier)

---

## Test Scenarios

### Scenario 1: Customer Return

**Steps:**
1. Customer brings item to return (must have original receipt)
2. Open Exchange/Trade-in modal → Select "Return" tab
3. Enter receipt number → Validate original sale
4. Select item from original sale
5. Set condition (excellent, good, fair, damaged, defective)
6. Set return value (defaults to original price, can be overridden for partial refunds)
7. Complete transaction
8. Process refund (cash/card/store credit)

**Expected Results:**
- ✅ Returned item is added back to inventory automatically
- ✅ Stock quantity increases for the returned product
- ✅ Refund record is created
- ✅ Transaction appears in Exchange Management page
- ✅ Original sale can be linked to return

**Edge Cases to Test:**
- Return item not in original sale (should fail)
- Return quantity exceeds original purchase (should fail)
- Return with damaged condition and partial refund
- Return with defective condition (may not add to inventory)

---

### Scenario 2: Trade-in (New Customer)

**Steps:**
1. Open Exchange/Trade-in modal → Select "Trade-in" tab
2. Search/select customer OR create new customer
3. Enter trade-in item details:
   - Product name (required)
   - SKU/Barcode (optional)
   - Quantity
   - Condition
   - **Trade-in Value** (manual entry required - this is the key field)
4. Optionally click "Suggest" button for estimated value based on condition
5. Add new items customer wants to purchase
6. System calculates: New item total - Trade-in value = Additional payment
7. Process additional payment
8. Complete transaction

**Expected Results:**
- ✅ Trade-in item is added to inventory (product created if doesn't exist)
- ✅ New items purchased reduce stock
- ✅ Sale record is created for new purchase
- ✅ Transaction appears in Exchange Management
- ✅ Stock quantities update correctly

**Key Testing Points:**
- **Manual value entry is PRIMARY** - vendor must enter trade-in value
- "Suggest" button provides optional estimated value (not required)
- Product creation for trade-in items that don't exist in system
- Stock restoration happens automatically on completion

**Edge Cases to Test:**
- Trade-in value higher than new item price (customer gets credit/store credit)
- Trade-in item that already exists in inventory (should add to existing product)
- Trade-in item with no product match (creates new product)
- Multiple trade-in items in one transaction

---

### Scenario 3: Trade-in (Existing Customer)

**Steps:**
Same as Scenario 2, but customer already exists in system

**Expected Results:**
- ✅ Customer history is tracked
- ✅ All other results same as Scenario 2

---

### Scenario 4: Exchange (Return + New Purchase)

**Steps:**
1. Open Exchange/Trade-in modal → Select "Return" tab
2. Process return (as in Scenario 1)
3. Switch to add new purchase items
4. System calculates: New item total - Return value = Additional payment
5. Process additional payment
6. Complete transaction

**Expected Results:**
- ✅ Returned item added to inventory
- ✅ New items reduce stock
- ✅ Sale record created for new purchase
- ✅ Single transaction tracks both return and purchase

---

## Key Features to Test

### 1. Value Entry (Critical)
- **Trade-in items**: Manual value entry is REQUIRED
- **Return items**: Defaults to original price, can be overridden
- "Suggest" button provides optional estimated value (does not auto-fill, just suggests)
- System should NOT force auto-calculation - vendor decides value

### 2. Stock Management
- **Automatic restoration**: When transaction is completed, stock is automatically updated
- Returned items: Added back to original product stock
- Trade-in items: Added to inventory (product created if needed)
- Purchase items: Stock reduced
- All stock changes happen automatically via database trigger

### 3. Product Creation
- Trade-in items not in system are automatically created as products
- Product details (name, SKU, barcode) from trade-in form
- Initial stock set to trade-in quantity
- Product is active and available

### 4. Condition Handling
- **Excellent/Good**: Full stock restoration
- **Fair**: Stock restored, can be sold at discount
- **Damaged**: Stock restored (can be excluded via "Add to Inventory" toggle)
- **Defective**: Can be excluded from inventory if not repairable

### 5. Sales Integration
- When exchange includes new purchases, a sale record is automatically created
- Sale notes include exchange transaction number
- Sale appears in sales reports and history
- Sale can be linked back to exchange via notes

---

## UI Components to Test

### Exchange/Trade-in Modal
- **Tabs**: Return, Trade-in, Exchange
- **Customer Search**: Search existing customers or create new
- **Product Search**: For trade-ins, search existing products or enter new product details
- **Value Entry**: Manual input field (required for trade-ins)
- **Suggest Button**: Optional value suggestion based on condition
- **Condition Selection**: Dropdown with 5 options
- **Purchase Items**: Add new items customer wants to buy
- **Summary**: Shows trade-in value, purchase amount, balance
- **Complete Button**: Finalizes transaction

### Exchange Management Page
- **List View**: All exchange transactions
- **Filters**: By type (return/trade-in/exchange), status, date range
- **Search**: By transaction number, customer name, receipt number
- **Detail View**: Click transaction to see full details
- **Status Badges**: Pending, Completed, Cancelled, Refunded

---

## API Endpoints

### POST `/api/exchanges`
- Create new exchange transaction
- **Test**: Create return, trade-in, and exchange transactions

### GET `/api/exchanges`
- List transactions with filters
- **Test**: Filter by store, customer, status, type, date range

### GET `/api/exchanges/[id]`
- Get transaction details
- **Test**: View complete transaction with all items and refunds

### POST `/api/exchanges/[id]/complete`
- Complete transaction (triggers stock restoration)
- **Test**: Complete pending transactions and verify stock updates

### POST `/api/exchanges/validate-return`
- Validate return against original sale
- **Test**: Valid receipt, invalid receipt, item not in sale

### POST `/api/exchanges/calculate-tradein-value`
- Calculate suggested trade-in value
- **Test**: Different conditions, different products

---

## Database Tables

### `exchange_transaction`
- Main transaction record
- Links to store, customer, cashier, original sale

### `exchange_item`
- Items being returned/traded in
- Links to original sale item (for returns) or product (for trade-ins)

### `exchange_purchase_item`
- New items purchased in exchange
- Links to products

### `exchange_refund`
- Refund records for returns
- Tracks refund amount, method, status

---

## Critical Validations

1. **Return Validation**
   - ✅ Receipt number must exist
   - ✅ Item must be in original sale
   - ✅ Return quantity cannot exceed original purchase quantity
   - ✅ Cannot return same item multiple times

2. **Trade-in Validation**
   - ✅ Trade-in value must be entered manually (required)
   - ✅ Product name is required
   - ✅ Quantity must be positive
   - ✅ Condition must be selected

3. **Stock Validation**
   - ✅ Purchase items must have sufficient stock
   - ✅ Stock updates automatically on completion
   - ✅ Cannot complete if stock insufficient

4. **Payment Validation**
   - ✅ Additional payment required if purchase amount > trade-in value
   - ✅ Refund processed for returns
   - ✅ Store credit option available

---

## Edge Cases & Error Scenarios

1. **Invalid Return**
   - Receipt number doesn't exist → Error message
   - Item not in original sale → Error message
   - Return quantity exceeds purchase → Error message

2. **Stock Issues**
   - Insufficient stock for purchase items → Error message
   - Stock not updated after completion → Bug (should auto-update)

3. **Value Entry**
   - Empty trade-in value → Error message (required)
   - Negative value → Validation error
   - Very large value → Should work (vendor decision)

4. **Product Creation**
   - Trade-in item with duplicate SKU → Should link to existing product
   - Trade-in item with no details → Should still create product

5. **Transaction States**
   - Complete already completed transaction → Error
   - Cancel completed transaction → Should not be allowed
   - Complete transaction with no items → Should fail

---

## Success Criteria

✅ **Value Entry**: Manual entry works, suggest button is optional helper
✅ **Stock Management**: Automatic restoration works correctly for all scenarios
✅ **Product Creation**: Trade-in items automatically added to inventory
✅ **Sales Integration**: Sales created when purchases included
✅ **Transaction Tracking**: All transactions visible in Exchange Management
✅ **Validation**: All validations work correctly
✅ **Error Handling**: Clear error messages for invalid operations

---

## Notes for QA

- **Manual Value Entry is Key**: The system prioritizes vendor judgment over auto-calculation
- **Stock is Automatic**: No manual stock updates needed - happens on transaction completion
- **Sales are Created**: Exchange purchases automatically create sale records
- **Product Creation**: Trade-in items automatically become products if they don't exist
- **All Transactions Tracked**: Everything appears in Exchange Management page
