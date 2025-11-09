# Subdomain Setup Guide for Vercel

This guide explains how to configure subdomain routing so that:
- **Main website**: `https://scims.app` (landing pages, marketing)
- **App dashboard**: `https://pos.scims.app` (dashboard, auth, admin)

## Code Changes (Already Done)

The following changes have been made to support subdomain routing:

1. **Middleware Updated** (`src/middleware.ts`):
   - Detects subdomain from request headers
   - Redirects app routes from main domain to subdomain
   - Redirects landing routes from subdomain to main domain

2. **Vercel Configuration** (`vercel.json`):
   - Basic configuration file created for Vercel deployment

## Vercel Setup Steps

### Step 1: Add Subdomain to Vercel Project

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Add the subdomain: `pos.scims.app`
4. Vercel will automatically configure DNS records

### Step 2: Configure DNS Records

You need to add a CNAME record for the subdomain:

**Option A: Using Vercel's DNS (Recommended)**
- If your domain is managed by Vercel, the CNAME will be added automatically
- Verify it points to: `cname.vercel-dns.com` or similar

**Option B: Using External DNS Provider**
- Add a CNAME record:
  - **Name**: `pos`
  - **Value**: `cname.vercel-dns.com` (or your Vercel project domain)
  - **TTL**: 3600 (or default)

### Step 3: Verify Domain Configuration

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Ensure both domains are listed:
   - `scims.app` (main domain)
   - `pos.scims.app` (subdomain)
3. Both should show "Valid Configuration"

### Step 4: Deploy

1. Push your code changes to your repository
2. Vercel will automatically deploy
3. Test the subdomain routing:
   - Visit `https://scims.app` → Should show landing page
   - Visit `https://pos.scims.app/dashboard` → Should show app (or redirect to login)
   - Visit `https://scims.app/dashboard` → Should redirect to `https://pos.scims.app/dashboard`

## How It Works

### Route Mapping

**Main Domain (`scims.app`):**
- `/` → Landing page
- `/features` → Features page
- `/pricing` → Pricing page
- `/contact` → Contact page
- `/docs` → Documentation
- `/business-types` → Business types
- `/demo` → Demo page
- `/dashboard` → **Redirects to** `pos.scims.app/dashboard`
- `/auth/login` → **Redirects to** `pos.scims.app/auth/login`

**Subdomain (`pos.scims.app`):**
- `/dashboard` → Dashboard
- `/auth/login` → Login page
- `/auth/register` → Registration
- `/products` → Products management
- `/pos` → Point of Sale
- `/stores` → Store management
- `/staff` → Staff management
- All other app routes...
- `/` → **Redirects to** `scims.app`
- `/features` → **Redirects to** `scims.app/features`

### API Routes

API routes (`/api/*`) are accessible from both domains to maintain functionality.

## Testing

After deployment, test the following:

1. **Main Domain Landing Pages:**
   ```
   https://scims.app → Should work
   https://scims.app/features → Should work
   https://scims.app/pricing → Should work
   ```

2. **Subdomain App Routes:**
   ```
   https://pos.scims.app/dashboard → Should work (or redirect to login)
   https://pos.scims.app/auth/login → Should work
   https://pos.scims.app/products → Should work
   ```

3. **Automatic Redirects:**
   ```
   https://scims.app/dashboard → Should redirect to https://pos.scims.app/dashboard
   https://pos.scims.app/ → Should redirect to https://scims.app
   https://pos.scims.app/features → Should redirect to https://scims.app/features
   ```

## Troubleshooting

### Subdomain Not Working

1. **Check DNS Propagation:**
   ```bash
   dig pos.scims.app
   # or
   nslookup pos.scims.app
   ```
   Should return a CNAME pointing to Vercel

2. **Check Vercel Domain Configuration:**
   - Go to Vercel dashboard → Settings → Domains
   - Ensure `pos.scims.app` is listed and shows "Valid Configuration"

3. **Check SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Wait a few minutes after adding the domain

### Redirects Not Working

1. **Clear Browser Cache:**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or use incognito/private mode

2. **Check Middleware:**
   - Ensure `src/middleware.ts` is deployed
   - Check Vercel function logs for errors

3. **Verify Environment Variables:**
   - Ensure `NEXT_PUBLIC_BASE_URL` is set correctly in Vercel

### Development Testing

For local development, you can test subdomain routing by:

1. **Using hosts file** (macOS/Linux):
   ```bash
   sudo nano /etc/hosts
   # Add:
   127.0.0.1 pos.localhost
   ```

2. **Access via:**
   - `http://localhost:3000` (main domain simulation)
   - `http://pos.localhost:3000` (subdomain simulation)

Note: The middleware will detect `pos.localhost` as a subdomain.

## Environment Variables

Ensure these are set in Vercel:

- `NEXT_PUBLIC_BASE_URL`: `https://scims.app` (for main domain)
- All other existing environment variables

## Additional Notes

- The middleware handles subdomain detection automatically
- API routes work on both domains
- Cookies and authentication work across subdomains if configured correctly
- SEO: Landing pages remain on main domain for better SEO
- Security: App routes are isolated on subdomain

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify DNS configuration
4. Test with curl to see redirects:
   ```bash
   curl -I https://scims.app/dashboard
   # Should return 307/308 redirect to pos.scims.app
   ```

