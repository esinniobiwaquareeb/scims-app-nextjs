# Subdomain Setup Guide for Vercel

This guide explains how to configure subdomain routing so that:
- **Main website**: `https://scims.app` (landing pages, marketing)
- **App dashboard**: `https://pos.scims.app` (dashboard, auth, admin)
- **Storefronts**: `https://[slug].scims.app` (e.g., `https://techmart.scims.app` for business with slug "techmart")

## Code Changes (Already Done)

The following changes have been made to support subdomain routing:

1. **Middleware Updated** (`src/middleware.ts`):
   - Detects subdomain from request headers
   - Redirects app routes from main domain to subdomain
   - Redirects landing routes from subdomain to main domain

2. **Vercel Configuration** (`vercel.json`):
   - Basic configuration file created for Vercel deployment

## Vercel Setup Steps

### Step 1: Add App Subdomain to Vercel Project

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Add the subdomain: `pos.scims.app`
4. Vercel will automatically configure DNS records

### Step 2: Configure Wildcard Subdomain for Storefronts (Recommended)

To support dynamic storefront subdomains (e.g., `techmart.scims.app`, `mystore.scims.app`), you need to add a wildcard subdomain:

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add a wildcard domain: `*.scims.app`
3. This will automatically handle all storefront subdomains

**Alternative: Manual Subdomain Setup**
If you prefer to add storefront subdomains manually:
- Add each subdomain individually (e.g., `techmart.scims.app`)
- This gives you more control but requires manual setup for each business

### Step 3: Configure DNS Records

**For App Subdomain (`pos.scims.app`):**
- Add a CNAME record:
  - **Name**: `pos`
  - **Value**: `cname.vercel-dns.com` (or your Vercel project domain)
  - **TTL**: 3600 (or default)

**For Storefront Subdomains (Wildcard):**
- If using wildcard, add a CNAME record:
  - **Name**: `*`
  - **Value**: `cname.vercel-dns.com` (or your Vercel project domain)
  - **TTL**: 3600 (or default)
- Vercel will automatically handle all subdomains matching the wildcard

**Note:** If your domain is managed by Vercel, DNS records are configured automatically.

### Step 4: Verify Domain Configuration

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Ensure domains are listed:
   - `scims.app` (main domain)
   - `pos.scims.app` (app subdomain)
   - `*.scims.app` (wildcard for storefronts, if using)
3. All should show "Valid Configuration"

### Step 5: Deploy

1. Push your code changes to your repository
2. Vercel will automatically deploy
3. Test the subdomain routing:
   - Visit `https://scims.app` → Should show landing page
   - Visit `https://pos.scims.app/dashboard` → Should show app (or redirect to login)
   - Visit `https://scims.app/dashboard` → Should redirect to `https://pos.scims.app/dashboard`
   - Visit `https://techmart.scims.app` → Should show storefront for business with slug "techmart"
   - Visit `https://scims.app/s/techmart` → Should still work (original route)

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
- `/s/[slug]` → Storefront (e.g., `/s/techmart`)
- `/dashboard` → **Redirects to** `pos.scims.app/dashboard`
- `/auth/login` → **Redirects to** `pos.scims.app/auth/login`

**App Subdomain (`pos.scims.app`):**
- `/dashboard` → Dashboard
- `/auth/login` → Login page
- `/auth/register` → Registration
- `/products` → Products management
- `/pos` → Point of Sale
- `/stores` → Store management
- `/staff` → Staff management
- All other app routes...
- `/` → **Redirects to** dashboard or login
- `/features` → **Redirects to** `scims.app/features`

**Storefront Subdomains (`[slug].scims.app`, e.g., `techmart.scims.app`):**
- `/` → Storefront homepage (rewritten to `/s/[slug]`)
- All paths → Storefront pages (rewritten to `/s/[slug]/*`)
- API routes work normally (not rewritten)

### API Routes

API routes (`/api/*`) are accessible from all domains to maintain functionality. Storefront subdomains can access public APIs like `/api/public/store/[slug]` and `/api/public/order`.

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

2. **Automatic Redirects:**
   ```
   https://scims.app/dashboard → Should redirect to https://pos.scims.app/dashboard
   https://pos.scims.app/ → Should redirect to dashboard or login
   https://pos.scims.app/features → Should redirect to https://scims.app/features
   ```

3. **Storefront Subdomains:**
   ```
   https://techmart.scims.app → Should show storefront (rewritten to /s/techmart)
   https://techmart.scims.app/api/public/store/techmart → Should work (API route, not rewritten)
   https://scims.app/s/techmart → Should still work (original route)
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

