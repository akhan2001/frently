// Next.js 16 renamed `middleware` → `proxy`. Same edge boundary, same purpose.
//
// Role-aware gate:
//   - /dashboard, /listings/new, /listings/[id]   → any authenticated user
//   - /admin, /admin/*                             → agent only
//   - /listings/new                                → landlord only (agents → /admin)
//   - /login, /signup with session                 → /dashboard | /admin (by role)
//
// When kicking an unauthenticated user off a protected route, the original
// path is preserved as `?redirectTo=<path>` so AuthPage can land them where
// they meant to go after sign-in.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_PREFIX = '/admin';
const LANDLORD_ONLY = ['/listings/new']; // agents bounced to /admin
const LANDLORD_PROTECTED = ['/dashboard', '/listings/new'];
// /listings/[id] but NOT /listings (the public page) and NOT /listings/new
const LISTING_DETAIL_RE = /^\/listings\/[^/]+(?:\/.*)?$/;
const AUTH_PAGES = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + '/');
  const isListingDetail =
    LISTING_DETAIL_RE.test(pathname) && pathname !== '/listings/new';
  const isLandlordProtected =
    LANDLORD_PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    isListingDetail;
  const isLandlordOnly = LANDLORD_ONLY.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Not signed in + protected route → /login (preserve target as ?redirectTo).
  if (!user && (isAdmin || isLandlordProtected)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Signed in — we need role to decide /admin, /listings/new, and auth pages.
  if (user && (isAdmin || isAuthPage || isLandlordOnly)) {
    const { data: profile } = await supabase
      .schema('frently')
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: 'landlord' | 'agent' }>();
    const role = profile?.role ?? 'landlord';

    if (isAdmin && role !== 'agent') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }

    if (isLandlordOnly && role === 'agent') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      return NextResponse.redirect(url);
    }

    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'agent' ? '/admin' : '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
