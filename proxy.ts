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
//
// Fail-open everywhere: if env is missing or Supabase is unreachable, this
// proxy logs and lets the request through rather than 500'ing the entire
// site. The page itself or the API route will still enforce auth as a
// second line of defense.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_PREFIX = '/admin';
const LANDLORD_ONLY = ['/listings/new']; // agents bounced to /admin
const LANDLORD_PROTECTED = ['/dashboard', '/listings/new'];
const LISTING_DETAIL_RE = /^\/listings\/[^/]+(?:\/.*)?$/;
const AUTH_PAGES = ['/login', '/signup'];

type AuthCheck =
  | { ok: false }
  | { ok: true; userId: string | null; role: 'landlord' | 'agent' };

async function authCheck(
  request: NextRequest,
  url: string,
  anon: string,
  needRole: boolean,
  setCookieResponse: (r: NextResponse) => void,
): Promise<AuthCheck> {
  try {
    let outResponse = NextResponse.next({ request });
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          outResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            outResponse.cookies.set(name, value, options),
          );
        },
      },
    });
    setCookieResponse(outResponse);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: true, userId: null, role: 'landlord' };

    if (!needRole) return { ok: true, userId: user.id, role: 'landlord' };

    try {
      const { data: profile } = await supabase
        .schema('frently')
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle<{ role: 'landlord' | 'agent' }>();
      return { ok: true, userId: user.id, role: profile?.role ?? 'landlord' };
    } catch (err) {
      console.error('[proxy] role lookup failed; defaulting to landlord.', err);
      return { ok: true, userId: user.id, role: 'landlord' };
    }
  } catch (err) {
    console.error('[proxy] Supabase auth check failed; passing request through.', err);
    return { ok: false };
  }
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error(
      '[proxy] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
        '— auth gating is DISABLED. Set these in your Vercel env vars.',
    );
    return response;
  }

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
  const needRole = isAdmin || isAuthPage || isLandlordOnly;

  const check = await authCheck(request, url, anon, needRole, (r) => {
    response = r;
  });
  if (!check.ok) return response;

  const { userId, role } = check;

  if (!userId && (isAdmin || isLandlordProtected)) {
    const u = request.nextUrl.clone();
    u.pathname = '/login';
    u.search = '';
    u.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(u);
  }

  if (userId) {
    if (isAdmin && role !== 'agent') {
      const u = request.nextUrl.clone();
      u.pathname = '/dashboard';
      u.search = '';
      return NextResponse.redirect(u);
    }
    if (isLandlordOnly && role === 'agent') {
      const u = request.nextUrl.clone();
      u.pathname = '/admin';
      u.search = '';
      return NextResponse.redirect(u);
    }
    if (isAuthPage) {
      const u = request.nextUrl.clone();
      u.pathname = role === 'agent' ? '/admin' : '/dashboard';
      u.search = '';
      return NextResponse.redirect(u);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
