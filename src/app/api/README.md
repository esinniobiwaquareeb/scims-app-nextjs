# SCIMS API Endpoints

This document outlines all available API endpoints for the SCIMS (Stock Control Inventory Management System) Next.js application.

## Authentication Endpoints

### POST `/api/auth/login`
- **Purpose**: Authenticate user login
- **Body**: `{ username: string, password: string }`
- **Returns**: User data with authentication token

### GET `/api/auth/demo-users`
- **Purpose**: Fetch demo users for testing
- **Returns**: List of demo users with credentials

### POST `/api/auth/logout`
- **Purpose**: Logout user and clear session
- **Returns**: Success confirmation

## Activity Logs

### GET `/api/activity-logs`
- **Purpose**: Fetch activity logs with filters
- **Query Parameters**:
  - `user_id`: Filter by user
  - `business_id`: Filter by business
  - `store_id`: Filter by store
  - `category`: Filter by activity category
  - `activity_type`: Filter by activity type
  - `start_date`: Filter from date
  - `end_date`: Filter to date
  - `limit`: Pagination limit (default: 100)
  - `offset`: Pagination offset (default: 0)

### POST `/api/activity-logs`
- **Purpose**: Create new activity log
- **Body**: Activity log data

### DELETE `/api/activity-logs/clear`
- **Purpose**: Clear all activity logs
- **Returns**: Success confirmation

## Business Management

### GET `/api/businesses`
- **Purpose**: Fetch all businesses (superadmin only)
- **Query Parameters**:
  - `limit`: Pagination limit
  - `offset`: Pagination offset

### POST `/api/businesses`
- **Purpose**: Create new business
- **Body**: Business data
- **Returns**: Created business with admin user and default store

### GET `/api/businesses/[id]`
- **Purpose**: Fetch specific business
- **Returns**: Business details

### PUT `/api/businesses/[id]`
- **Purpose**: Update business
- **Body**: Updated business data

### DELETE `/api/businesses/[id]`
- **Purpose**: Delete business and all related data
- **Returns**: Deletion summary

## Product Management

### GET `/api/products`
- **Purpose**: Fetch products with filters
- **Query Parameters**:
  - `store_id`: Filter by store
  - `business_id`: Filter by business
  - `category_id`: Filter by category
  - `supplier_id`: Filter by supplier
  - `brand_id`: Filter by brand
  - `is_active`: Filter by active status
  - `limit`: Pagination limit
  - `offset`: Pagination offset

### POST `/api/products`
- **Purpose**: Create new product
- **Body**: Product data
- **Returns**: Created product with joins

### GET `/api/products/[id]`
- **Purpose**: Fetch specific product
- **Returns**: Product details with joins

### PUT `/api/products/[id]`
- **Purpose**: Update product
- **Body**: Updated product data

### DELETE `/api/products/[id]`
- **Purpose**: Delete product
- **Returns**: Success confirmation

## Sales Management

### GET `/api/sales`
- **Purpose**: Fetch sales with filters
- **Query Parameters**:
  - `store_id`: Filter by store
  - `business_id`: Filter by business
  - `cashier_id`: Filter by cashier
  - `customer_id`: Filter by customer
  - `status`: Filter by sale status
  - `start_date`: Filter from date
  - `end_date`: Filter to date
  - `limit`: Pagination limit
  - `offset`: Pagination offset

### POST `/api/sales`
- **Purpose**: Process new sale
- **Body**: Sale data with items
- **Returns**: Created sale
- **Features**: 
  - Automatic stock updates
  - Payment method handling
  - Receipt number generation

## Category Management

### GET `/api/categories`
- **Purpose**: Fetch categories with filters
- **Query Parameters**:
  - `business_id`: Filter by business
  - `store_id`: Filter by store
  - `is_active`: Filter by active status
  - `limit`: Pagination limit
  - `offset`: Pagination offset

### POST `/api/categories`
- **Purpose**: Create new category
- **Body**: Category data

### GET `/api/categories/[id]`
- **Purpose**: Fetch specific category
- **Returns**: Category details

### PUT `/api/categories/[id]`
- **Purpose**: Update category
- **Body**: Updated category data

### DELETE `/api/categories/[id]`
- **Purpose**: Delete category
- **Returns**: Success confirmation

## Customer Management

### GET `/api/customers`
- **Purpose**: Fetch customers with filters
- **Query Parameters**:
  - `store_id`: Filter by store
  - `business_id`: Filter by business
  - `is_active`: Filter by active status
  - `limit`: Pagination limit
  - `offset`: Pagination offset
- **Features**: Includes sales analytics (purchases, total spent, last visit)

### POST `/api/customers`
- **Purpose**: Create new customer
- **Body**: Customer data

### GET `/api/customers/[id]`
- **Purpose**: Fetch specific customer
- **Returns**: Customer details

### PUT `/api/customers/[id]`
- **Purpose**: Update customer
- **Body**: Updated customer data

### DELETE `/api/customers/[id]`
- **Purpose**: Delete customer
- **Returns**: Success confirmation

## Staff Management

### GET `/api/staff`
- **Purpose**: Fetch staff with filters
- **Query Parameters**:
  - `business_id`: Filter by business
  - `store_id`: Filter by store
  - `role`: Filter by role
  - `is_active`: Filter by active status
  - `limit`: Pagination limit
  - `offset`: Pagination offset
- **Features**: Includes sales performance metrics

### POST `/api/staff`
- **Purpose**: Create new staff member
- **Body**: Staff data
- **Returns**: Created user with generated password

### GET `/api/staff/[id]`
- **Purpose**: Fetch specific staff member
- **Returns**: Staff details with store assignment

### PUT `/api/staff/[id]`
- **Purpose**: Update staff member
- **Body**: Updated staff data
- **Features**: Handles store assignment updates

### DELETE `/api/staff/[id]`
- **Purpose**: Delete staff member
- **Returns**: Success confirmation

## Dashboard Analytics

### GET `/api/dashboard/stats`
- **Purpose**: Fetch dashboard statistics
- **Query Parameters**:
  - `type`: 'store' or 'business'
  - `store_id`: Required if type is 'store'
  - `business_id`: Required if type is 'business'
- **Returns**: 
  - Store stats: sales, products, low stock, orders
  - Business stats: aggregated from all stores

## Common Features

### Pagination
Most endpoints support pagination with `limit` and `offset` parameters.

### Filtering
Endpoints support various filters based on the entity type.

### Error Handling
All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Success Responses
All endpoints return consistent success responses:
```json
{
  "success": true,
  "data": {...},
  "pagination": {...} // if applicable
}
```

### Authentication
Protected endpoints require valid authentication token via cookies.

## Data Relationships

- **Business** → **Store** → **Product/Customer/Sale**
- **User** → **UserBusinessRole** → **Business/Store**
- **Sale** → **SaleItem** → **Product**
- **Product** → **Category/Supplier/Brand**

## Security Features

- Server-side validation
- SQL injection protection via Supabase
- Authentication middleware
- Role-based access control
- Secure password hashing (bcrypt)
