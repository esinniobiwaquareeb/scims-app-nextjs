import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase, supabaseAnon } from '@/lib/supabase/config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Check if we're in local development environment
  const isLocalhost = hostname.includes('localhost') || 
                     hostname.includes('127.0.0.1') || 
                     hostname.includes('0.0.0.0') ||
                     hostname.startsWith('192.168.') ||
                     hostname.startsWith('10.') ||
                     hostname.startsWith('172.');
  
  // Skip subdomain routing in local development
  if (!isLocalhost) {
    // Production subdomain routing logic
    // Detect subdomain
    // Check for app subdomain (pos.scims.app or app.scims.app)
    const isAppSubdomain = hostname.startsWith('pos.') || hostname.startsWith('app.');
  
    // Extract storefront subdomain (e.g., "techmart" from "techmart.scims.app")
    // Storefront subdomains are any subdomain that's not "pos" or "app"
    let storefrontSlug: string | null = null;
    if (!isAppSubdomain && hostname.includes('.')) {
      const parts = hostname.split('.');
      // Check if it's a subdomain (has more than 2 parts: subdomain.domain.tld)
      // Or if it's exactly 2 parts and not the main domain
      if (parts.length >= 3 || (parts.length === 2 && parts[0] !== 'www' && parts[0] !== 'scims')) {
        const subdomain = parts[0];
        // Only treat as storefront if it's not www or scims
        if (subdomain && subdomain !== 'www' && subdomain !== 'scims') {
          storefrontSlug = subdomain;
        }
      }
    }
  
    const isStorefrontSubdomain = storefrontSlug !== null;
    // Main domain includes scims.app, www.scims.app, and any other non-app, non-storefront subdomains
    const isMainDomain = !isAppSubdomain && !isStorefrontSubdomain;
  
    // Define landing page routes (should only be on main domain)
    const landingRoutes = [
      '/',
      '/features',
      '/pricing',
      '/contact',
      '/help',
      '/support',
      '/terms',
      '/privacy',
      '/cookies',
      '/security',
      '/training',
      '/docs',
      '/business-types',
      '/demo',
      '/sitemap.xml'
    ];
  
    // Define app routes (should only be on subdomain)
    const appRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/verify-email',
      '/auth/reset-password',
      '/dashboard',
      '/businesses',
      '/products',
      '/customers',
      '/sales-report',
      '/stores',
      '/staff',
      '/cashiers',
      '/reports',
      '/restock',
      '/suppliers',
      '/categories',
      '/brands',
      '/roles',
      '/pos',
      '/notifications',
      '/activity-logs',
      '/business-settings',
      '/platform-settings',
      '/affiliate',
      '/affiliates',
      '/exchange-management',
      '/supply-management',
      '/product-sync',
      '/menu-management',
      '/subscriptions',
      '/discounts'
    ];
  
    // Handle storefront subdomain: Rewrite to /s/[slug] route
    // Exclude API routes, static files, and Next.js internals
    const isApiRoute = pathname.startsWith('/api/');
    const isStaticFile = pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico');
  
    if (isStorefrontSubdomain && storefrontSlug && !isApiRoute && !isStaticFile) {
      // Rewrite the request to the storefront route
      const rewriteUrl = new URL(`/s/${storefrontSlug}${pathname === '/' ? '' : pathname}`, request.url);
      rewriteUrl.search = request.nextUrl.search;
      return NextResponse.rewrite(rewriteUrl);
    }
  
    // Special handling: If on app subdomain root, redirect to dashboard (or login if not authenticated)
    if (isAppSubdomain && pathname === '/') {
      // Get token to check if user is authenticated
      const token = request.cookies.get('scims_auth_token')?.value;
      if (token) {
        // Redirect authenticated users to dashboard
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      } else {
        // Redirect unauthenticated users to login
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  
    // Redirect logic: If on main domain and accessing app route, redirect to subdomain
    if (isMainDomain && appRoutes.some(route => pathname.startsWith(route))) {
      const appUrl = new URL(pathname, `https://pos.scims.app${request.nextUrl.search}`);
      return NextResponse.redirect(appUrl);
    }
  
    // Redirect logic: If on subdomain and accessing landing route (except root), redirect to main domain
    if (isAppSubdomain && landingRoutes.some(route => {
      // Skip root path - it's handled above
      if (route === '/') {
        return false;
      }
      return pathname.startsWith(route);
    })) {
      const mainUrl = new URL(pathname, `https://scims.app${request.nextUrl.search}`);
      return NextResponse.redirect(mainUrl);
    }
  }
  
  // Public routes that don't require authentication (accessible on both domains)
  const publicRoutes = [
    '/', 
    '/auth/login', 
    '/auth/register',
    '/features',
    '/pricing',
    '/contact',
    '/help',
    '/support',
    '/terms',
    '/privacy',
    '/cookies',
    '/security',
    '/training',
    '/docs',
    '/business-types',
    '/demo',
    '/sitemap.xml',
    '/s/' // Storefront routes are public
  ];
  const authApiPrefixes = ['/api/auth'];
  const publicApiPrefixes = ['/api/platform/settings', '/api/languages', '/api/currencies'];
  const statusPath = '/status';
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Get the token from cookies
  const token = request.cookies.get('scims_auth_token')?.value;
  
  // If accessing a protected route without a token, redirect to login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing login page with a valid token, redirect to dashboard
  if (pathname === '/auth/login' && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Platform access and maintenance mode gating
  try {
    const isApiRoute = pathname.startsWith('/api/');
    const isStatusPage = pathname.startsWith(statusPath);

    // Fetch platform settings directly from Supabase
    const { data: platformSettings } = await supabase
      .from('platform_setting')
      .select('maintenance_mode, enable_platform_access')
      .single();

    const maintenance = platformSettings?.maintenance_mode === true;
    const platformAccessEnabled = platformSettings?.enable_platform_access !== false; // Default to true if not set

    // Check if user is superadmin
    // Use anon client to validate user token (respects RLS)
    let isSuperAdmin = false;
    if (token) {
      try {
        // Validate token with anon client (doesn't bypass RLS)
        const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
        if (user && !authError) {
          // Check user role using service client (needed for role lookup)
          const { data: userPermissions } = await supabase
            .from('user_role_view')
            .select('role_name')
            .eq('user_id', user.id)
            .single();
          isSuperAdmin = userPermissions?.role_name === 'superadmin';
        }
      } catch {
        // Token invalid or expired - user will be redirected to login
        // Silently fail to allow normal flow
      }
    }

    // Platform access control (affects everyone except superadmin)
    if (!platformAccessEnabled && !isSuperAdmin) {
      if (isApiRoute) {
        // Block authentication and platform APIs, but allow public APIs
        if (authApiPrefixes.some(p => pathname.startsWith(p)) || 
            pathname.startsWith('/api/dashboard') ||
            pathname.startsWith('/api/businesses') ||
            pathname.startsWith('/api/products') ||
            pathname.startsWith('/api/customers') ||
            pathname.startsWith('/api/sales') ||
            pathname.startsWith('/api/stores') ||
            pathname.startsWith('/api/staff') ||
            pathname.startsWith('/api/cashiers') ||
            pathname.startsWith('/api/reports') ||
            pathname.startsWith('/api/restock') ||
            pathname.startsWith('/api/suppliers') ||
            pathname.startsWith('/api/categories') ||
            pathname.startsWith('/api/brands') ||
            pathname.startsWith('/api/roles') ||
            pathname.startsWith('/api/saved-carts') ||
            pathname.startsWith('/api/notifications') ||
            pathname.startsWith('/api/activity-logs') ||
            pathname.startsWith('/api/user-business-roles') ||
            pathname.startsWith('/api/user-roles') ||
            pathname.startsWith('/api/permissions')) {
          const res503 = NextResponse.json({ 
            error: 'Platform access is currently disabled. Please contact support.' 
          }, { status: 503 });
          res503.cookies.delete('scims_auth_token');
          return res503;
        }
        return NextResponse.next();
      }
      
      // Block authentication routes and protected platform routes
      const protectedRoutes = [
        '/auth/login',
        '/auth/register', 
        '/auth/verify-email',
        '/auth/reset-password',
        '/dashboard',
        '/businesses',
        '/products',
        '/customers',
        '/sales-report',
        '/stores',
        '/staff',
        '/cashiers',
        '/reports',
        '/restock',
        '/suppliers',
        '/categories',
        '/brands',
        '/roles',
        '/pos',
        '/notifications',
        '/activity-logs',
        '/business-settings',
        '/platform-settings'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (isProtectedRoute) {
        // Redirect to status page with platform access message
        const statusUrl = new URL(statusPath, request.url);
        statusUrl.searchParams.set('platform_access', 'disabled');
        const redirect = NextResponse.redirect(statusUrl);
        redirect.cookies.delete('scims_auth_token');
        return redirect;
      }
    }

    // Maintenance mode control (affects everyone except superadmin)
    if (maintenance && !isSuperAdmin) {
      // During maintenance: block ALL sign-ins and app access for users/businesses
      // Allow only platform settings and basic public meta APIs so the banner can render
      if (isApiRoute) {
        // allow auth API to enable superadmin login
        if (!(publicApiPrefixes.some(p => pathname.startsWith(p)) || authApiPrefixes.some(p => pathname.startsWith(p)))) {
          const res503 = NextResponse.json({ error: 'System is under maintenance. Please try again later.' }, { status: 503 });
          // Force sign-out by clearing auth cookie
          res503.cookies.delete('scims_auth_token');
          return res503;
        }
        return NextResponse.next();
      }
      // If status page, allow to render message without redirect loop
      if (isStatusPage) {
        return NextResponse.next();
      }

      // For app routes (including /auth), redirect to status page and clear auth
      const statusUrl = new URL(statusPath, request.url);
      statusUrl.searchParams.set('maintenance', '1');
      const redirect = NextResponse.redirect(statusUrl);
      redirect.cookies.delete('scims_auth_token');
      return redirect;
    }

    return NextResponse.next();
  } catch {
    // On any failure, fall through and allow
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - status (status page to avoid redirect loops)
     * - image files (*.png, *.jpg, *.jpeg, *.gif, *.svg, *.webp, *.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|status|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico).*)',
  ],
};
