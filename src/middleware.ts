import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
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
    '/sitemap.xml'
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
    let isSuperAdmin = false;
    if (token) {
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: userPermissions } = await supabase
            .from('user_role_view')
            .select('role_name')
            .eq('user_id', user.id)
            .single();
          isSuperAdmin = userPermissions?.role_name === 'superadmin';
        }
      } catch {}
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|status).*)',
  ],
};
