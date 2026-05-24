// /admin/listings/[id] — agent completes Part 2.
// Server component fetches the listing (RLS lets agents read every row).
// Two-column layout: landlord-submitted data on the left, agent form on the right.
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { StatusBadge } from '@/components/listing/StatusBadge';
import { AdminListingForm } from '@/components/listing/admin/AdminListingForm';
import { Part1Reference } from '@/components/listing/admin/Part1Reference';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase-server';
import { IconChevronLeft } from '@/components/icons';
import type { Listing } from '@/types/listing';

export default async function AdminListingPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  // Role check (proxy already gates /admin/*, but defense in depth).
  const { data: profile } = await supabase
    .schema('frently')
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: 'landlord' | 'agent' }>();
  if (profile?.role !== 'agent') redirect(ROUTES.DASHBOARD);

  const { data: listing } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle<Listing>();
  if (!listing) notFound();

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container className="py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={ROUTES.ADMIN}
              className="text-[12.5px] text-muted hover:text-ink inline-flex items-center gap-1"
            >
              <IconChevronLeft size={13} color="currentColor" /> Back to admin
            </Link>
            <StatusBadge status={listing.status} />
          </div>

          <div className="grid lg:grid-cols-[360px_1fr] gap-8">
            <Part1Reference listing={listing} />
            <div className="min-w-0">
              <header className="mb-6">
                <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium mb-1.5">
                  Part 2 — MLS / Technical
                </div>
                <h1
                  className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-ink"
                  style={{ textWrap: 'balance' }}
                >
                  Complete the technical fields
                </h1>
                <p className="text-[13px] text-muted mt-1.5">
                  Fill in everything the landlord can&apos;t. Save Progress at any time. When all
                  required fields are populated, mark the listing ready for MLS.
                </p>
              </header>

              <AdminListingForm listing={listing} />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
