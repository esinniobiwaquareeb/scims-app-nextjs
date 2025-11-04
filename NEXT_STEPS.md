# Next Steps - Action Items

## ✅ Immediate Actions (Required)

### 1. Add Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your values:

**Required:**
- `SUPABASE_URL` - From your Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase project settings → API → service_role key
- `SUPABASE_ANON_KEY` - From Supabase project settings → API → anon/public key ⚠️ **NEW - Required now**

**Optional (but recommended):**
- `UPSTASH_REDIS_REST_URL` - For production rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - For production rate limiting

### 2. Verify Environment Variables Load Correctly

Run the dev server and check for errors:

```bash
npm run dev
```

If you see an error about missing environment variables, double-check your `.env.local` file.

### 3. Test the Application

1. **Test Authentication:**
   - Try logging in
   - Verify middleware authentication works
   - Check that protected routes require login

2. **Test API Routes:**
   - Test the products API: `GET /api/products?store_id=<your-store-id>`
   - Check that rate limiting headers are present in responses
   - Verify error handling returns proper error format

3. **Check Security Headers:**
   - Open browser DevTools → Network tab
   - Check any response headers
   - Verify security headers are present:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `X-XSS-Protection: 1; mode=block`

## 🔄 Short-term Tasks (This Week)

### 4. Migrate Other API Routes

Update other API routes to use the new pattern. Start with frequently used routes:

**High Priority:**
- `/api/auth/login` - Add rate limiting (AUTH)
- `/api/auth/register` - Add rate limiting (AUTH)
- `/api/sales` - Add validation and rate limiting
- `/api/customers` - Add validation and rate limiting

**Example Migration:**

```typescript
// Before
export async function GET(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// After
import { createApiHandler } from '@/utils/api-wrapper';
import { validateQueryParams } from '@/utils/api-validation';
import { successResponse, AppError } from '@/utils/api-errors';

const handler = createApiHandler(async ({ request }) => {
  // ... logic
  return successResponse({ data });
}, { rateLimit: 'API' });

export const GET = handler;
```

### 5. Replace Console.log with Logger

Search for console.log/console.error in your codebase and replace with logger:

```typescript
// Before
console.log('User logged in');
console.error('Error:', error);

// After
import { logger } from '@/utils/logger';
logger.info('User logged in', { userId });
logger.error('Database error', { error }, error);
```

**Files to update** (found in previous search):
- `src/components/ProductSync.tsx`
- `src/components/CashierManagement.tsx`
- `src/components/StaffManagement.tsx`
- `src/utils/hooks/sales.ts`
- `src/app/api/staff/[id]/route.ts`
- And others...

### 6. Set Up Production Rate Limiting (Optional but Recommended)

If deploying to production:

1. Sign up for [Upstash Redis](https://upstash.com/) (free tier available)
2. Create a Redis database
3. Get REST URL and token
4. Add to production environment variables

Or continue using in-memory rate limiting (works but won't persist across server restarts).

## 📋 Medium-term Tasks (This Month)

### 9. Audit All API Routes

Review all API routes and ensure:
- ✅ Rate limiting is applied
- ✅ Input validation is in place
- ✅ Error handling uses new utilities
- ✅ Logging uses logger utility

### 10. Performance Monitoring

Consider adding:
- Error tracking (Sentry, Rollbar)
- Performance monitoring (Vercel Analytics already included)
- API usage analytics

### 11. Documentation

- Document API endpoints
- Create API usage examples
- Update internal documentation

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in production
- [ ] `SUPABASE_ANON_KEY` is set (critical!)
- [ ] Rate limiting configured (Redis or in-memory)
- [ ] Security headers verified
- [ ] Error handling tested
- [ ] All tests passing
- [ ] Build succeeds: `npm run build`
- [ ] No console.logs in production code
- [ ] Debug routes removed

## 🔍 Verification Checklist

After deployment:

- [ ] Authentication works correctly
- [ ] API routes respond with proper headers
- [ ] Rate limiting is active (check response headers)
- [ ] Security headers are present
- [ ] Error messages don't leak sensitive info
- [ ] Logs are being generated correctly

## 📞 Need Help?

If you encounter issues:

1. **Environment variable errors**: Check `.env.local` exists and has all required vars
2. **Rate limiting errors**: Check if Redis is configured or fallback to in-memory
3. **Type errors**: Run `npm run build` to see TypeScript errors
4. **Test failures**: Check test setup and environment variables

## 🎯 Priority Order

1. **Critical**: Add `SUPABASE_ANON_KEY` to `.env.local` (required for app to work)
2. **High**: Test authentication and middleware
3. **High**: Migrate authentication API routes
4. **Medium**: Replace console.logs with logger
5. **Medium**: Migrate other critical API routes
6. **Low**: Set up production Redis
7. **Low**: Add more tests

