# Backend Integration Guide

This document outlines the integration of the NestJS backend (`scims-backend`) with the Next.js frontend (`scims-nextjs`).

## Completed Tasks

### 1. Backend API Client
- Created `/src/lib/backend-api.ts` - Client-side API client for making requests to the backend
- Created `/src/utils/backend-proxy.ts` - Server-side proxy utility for Next.js API routes

### 2. Environment Configuration
- Updated `/src/lib/env.ts` to include `BACKEND_URL` and `NEXT_PUBLIC_BACKEND_URL`
- Removed Supabase environment variables

### 3. Authentication
- Updated `/src/app/api/auth/login/route.ts` to proxy to backend `/api/auth/login`
- Updated `/src/lib/auth.ts` to handle JWT tokens
- Updated `/src/contexts/AuthContext.tsx` to store JWT tokens

### 4. API Routes Updated
The following API routes have been updated to proxy to the backend:
- `/api/auth/login` - Login endpoint
- `/api/products` - Products CRUD
- `/api/stores` - Stores CRUD
- `/api/brands` - Brands CRUD
- `/api/auth/user-business` - User business data

## Remaining Tasks

### 1. Update Remaining API Routes
There are ~143 API route files that need to be updated. The pattern is:

**Before (Supabase):**
```typescript
import { supabase } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  const { data, error } = await supabase.from('table').select('*');
  // ...
}
```

**After (Backend Proxy):**
```typescript
import { proxyGet, proxyPost } from '@/utils/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(request, '/endpoint', {
    transformResponse: (data) => {
      // Transform backend response to match frontend expectations
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

### 2. Update React Hooks
Update all hooks in `/src/utils/hooks/` to use the backend API client:

**Before:**
```typescript
const response = await fetch('/api/products');
```

**After:**
```typescript
import { backendApi } from '@/lib/backend-api';
const response = await backendApi.get('/products');
```

### 3. Remove Supabase Dependencies
- Remove `@supabase/supabase-js` from `package.json`
- Delete `/src/lib/supabase/config.ts`
- Remove all Supabase imports from the codebase

### 4. Update Middleware
Update `/src/middleware.ts` to validate JWT tokens from the backend instead of Supabase.

### 5. Environment Variables
Update `.env.local` to include:
```env
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Remove:
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
```

## Backend API Endpoints

The backend runs on `http://localhost:3001` and exposes endpoints under `/api/`:

- `/api/auth/login` - POST - Login with username/password
- `/api/auth/register` - POST - Register new user
- `/api/products` - GET, POST - Products
- `/api/products/:id` - GET, PATCH, DELETE - Single product
- `/api/stores` - GET, POST - Stores
- `/api/stores/:id` - GET, PATCH, DELETE - Single store
- `/api/brands` - GET, POST - Brands
- `/api/brands/:id` - GET, PATCH, DELETE - Single brand
- ... (see backend Swagger docs at http://localhost:3001/api)

## Authentication Flow

1. User logs in via `/api/auth/login`
2. Backend returns JWT token in `access_token` field
3. Frontend stores token in `localStorage` as `scims_auth_token`
4. All subsequent requests include token in `Authorization: Bearer <token>` header
5. Backend validates token and returns data

## Testing

1. Start the backend: `cd scims-backend && npm run start:dev`
2. Start the frontend: `cd scims-nextjs && npm run dev`
3. Test login with provided credentials
4. Verify API calls are proxied correctly

## Notes

- The backend uses JWT authentication
- All API routes should proxy to the backend
- Response transformation may be needed to match frontend expectations
- The backend uses different response formats (e.g., `{ success: true, data: [...] }` vs `{ success: true, items: [...] }`)

