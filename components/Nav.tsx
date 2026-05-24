"use client";

// Site header — three mutually-exclusive auth states:
//   not logged in:  Log in | List my rental
//   landlord:       Dashboard | <full_name> | Sign out
//   agent:          Admin   | <full_name> | Sign out
//
// During the brief client-only auth-resolve window we render a fixed-height
// invisible slot so the header height never shifts. Sign out lives ONLY here —
// page bodies should not duplicate it.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Container } from '@/components/Container';
import { Wordmark } from '@/components/Wordmark';
import { IconArrowRight } from '@/components/icons';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useUser();

  const isAgent = profile?.role === 'agent';
  const homeHref = !user ? ROUTES.HOME : isAgent ? ROUTES.ADMIN : ROUTES.DASHBOARD;
  const primaryHref = isAgent ? ROUTES.ADMIN : ROUTES.DASHBOARD;
  const primaryLabel = isAgent ? 'Admin' : 'Dashboard';
  const primaryActive =
    pathname === primaryHref || pathname.startsWith(primaryHref + '/');

  const displayName =
    profile?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : '');

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(ROUTES.HOME);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-line">
      <Container>
        <div className="h-16 flex items-center justify-between gap-4">
          <Link href={homeHref} className="text-forest text-[22px]" aria-label="Frently home">
            <Wordmark />
          </Link>

          <div className="flex items-center gap-2 min-h-10">
            {loading ? (
              // Invisible spacer — preserves header geometry during hydration.
              <span aria-hidden className="h-10 w-32" />
            ) : !user ? (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="hidden sm:inline-flex h-10 px-4 text-[14px] font-medium text-body hover:text-ink rounded-full transition items-center"
                >
                  Log in
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-forest text-white text-[14px] font-medium hover:bg-forest-700 transition"
                >
                  List my rental <IconArrowRight size={15} color="#fff" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={primaryHref}
                  className={cn(
                    'inline-flex h-10 px-4 text-[14px] font-medium rounded-full transition items-center',
                    primaryActive ? 'text-ink' : 'text-body hover:text-ink',
                  )}
                >
                  {primaryLabel}
                </Link>
                {displayName && (
                  <span
                    className="hidden md:inline text-[13px] text-ink px-2 max-w-[200px] truncate"
                    title={displayName}
                  >
                    {displayName}
                  </span>
                )}
                <button
                  onClick={signOut}
                  className="h-10 px-4 text-[13px] text-body hover:text-ink border border-line rounded-full inline-flex items-center"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
