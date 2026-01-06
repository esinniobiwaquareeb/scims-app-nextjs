# API Routes Update Progress

## Summary
- **Total API Routes**: ~143 files
- **Updated**: ~30 routes (21%)
- **Remaining**: ~113 routes (79%)

## Updated Routes ✅

### Authentication
- ✅ `/api/auth/login`
- ✅ `/api/auth/user-business`

### Products
- ✅ `/api/products` (GET, POST)
- ✅ `/api/products/[id]` (GET, PUT, DELETE)

### Stores
- ✅ `/api/stores` (GET, POST)
- ✅ `/api/stores/[id]` (GET, PUT, DELETE)

### Brands
- ✅ `/api/brands` (GET, POST)
- ✅ `/api/brands/[id]` (PUT, DELETE)

### Categories
- ✅ `/api/categories` (GET, POST)
- ✅ `/api/categories/[id]` (GET, PUT, DELETE)

### Customers
- ✅ `/api/customers` (GET, POST)
- ✅ `/api/customers/[id]` (GET, PUT, DELETE)

### Suppliers
- ✅ `/api/suppliers` (GET, POST)
- ✅ `/api/suppliers/[id]` (PUT, DELETE)

### Expenses
- ✅ `/api/expenses` (GET, POST)
- ✅ `/api/expenses/[id]` (GET, PATCH, DELETE)

### Units
- ✅ `/api/units` (GET, POST)
- ✅ `/api/units/[id]` (GET, PUT, PATCH, DELETE)

### Reference Data
- ✅ `/api/currencies`
- ✅ `/api/languages`
- ✅ `/api/countries`

### Users/Cashiers
- ✅ `/api/cashiers` (GET, POST)
- ✅ `/api/cashiers/[id]` (GET, PUT, DELETE)

## Remaining Routes (High Priority) 🔴

### Sales (Critical)
- ⏳ `/api/sales` (GET, POST)
- ⏳ `/api/sales/[id]` (GET, PUT, DELETE)
- ⏳ `/api/sales/aggregated`

### Sale Returns
- ⏳ `/api/sale-returns` (GET, POST)
- ⏳ `/api/sale-returns/[id]` (GET, PATCH, DELETE)

### Stock Management
- ⏳ `/api/stock-transfers` (GET, POST)
- ⏳ `/api/stock-transfers/[id]` (GET, PUT, DELETE)
- ⏳ `/api/stock-adjustments` (GET, POST)
- ⏳ `/api/stock-adjustments/[id]` (GET, PUT, DELETE)

### Quotations
- ⏳ `/api/quotations` (GET, POST)
- ⏳ `/api/quotations/[id]` (GET, PUT, DELETE)
- ⏳ `/api/quotations/[id]/convert`
- ⏳ `/api/quotations/[id]/send`

### Supply Orders
- ⏳ `/api/supply-orders` (GET, POST)
- ⏳ `/api/supply-orders/[id]` (GET, PUT, DELETE)
- ⏳ `/api/supply-returns` (GET, POST)
- ⏳ `/api/supply-payments` (GET, POST)

### Restock Orders
- ⏳ `/api/restock-orders` (GET, POST)
- ⏳ `/api/restock-orders/[id]/status`
- ⏳ `/api/restock-orders/[id]/receive`

### Businesses
- ⏳ `/api/businesses` (GET, POST)
- ⏳ `/api/businesses/[id]` (GET, PUT, DELETE)
- ⏳ `/api/businesses/[id]/stores`
- ⏳ `/api/businesses/[id]/settings`

### Other Routes
- ⏳ `/api/dashboard/stats`
- ⏳ `/api/reports`
- ⏳ `/api/notifications`
- ⏳ `/api/activity-logs`
- ⏳ `/api/exchanges`
- ⏳ `/api/discounts/*`
- ⏳ `/api/roles/*`
- ⏳ `/api/staff/*`
- ⏳ `/api/upload/*`
- ⏳ `/api/public/*`
- ⏳ `/api/affiliates/*`
- ⏳ `/api/ai-agent/*`
- ⏳ And ~80 more routes...

## Update Pattern

For each route file, follow this pattern:

```typescript
// Before (Supabase)
import { supabase } from '@/lib/supabase/config';
export async function GET(request: NextRequest) {
  const { data, error } = await supabase.from('table').select('*');
  // ...
}

// After (Backend Proxy)
import { proxyGet, proxyPost, proxyPatch, proxyDelete } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/endpoint', {
    transformResponse: (data) => {
      if (data.success && data.data) {
        return {
          success: true,
          items: Array.isArray(data.data) ? data.data : [],
        };
      }
      return data;
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost(request, '/endpoint', body);
}
```

## Next Steps

1. Continue updating remaining routes systematically
2. Update React hooks to use backend API client
3. Remove Supabase dependencies
4. Update middleware for JWT validation
5. Test all endpoints

