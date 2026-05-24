// Resume editing an existing draft listing.
//
// Access rules (all enforced server-side, plus RLS as a defense layer):
//   - must be authenticated  → otherwise redirect to /login?redirectTo=/listings/[id]/edit
//   - must own the listing   → 404 if not (RLS already hides it; we just translate that)
//   - status must be 'draft' → otherwise redirect to /listings/[id]
//
// Renders the same multi-step ListingForm component with the saved values
// pre-filled. Each Next click PATCHes the same row by id.
import { notFound, redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ListingForm } from '@/components/listing/form/ListingForm';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase-server';
import type { Listing } from '@/types/listing';

export default async function EditListingPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`${ROUTES.LOGIN}?redirectTo=${encodeURIComponent(ROUTES.EDIT_LISTING(id))}`);
  }

  const { data: listing } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle<Listing>();

  // RLS hides rows the caller doesn't own; surface that as 404 rather than
  // leaking the existence of the id.
  if (!listing) notFound();

  // Defense in depth — RLS will already prevent updates from non-owners but
  // this avoids rendering a form they can't save.
  if (listing.user_id !== user.id) notFound();

  if (listing.status !== 'draft') {
    redirect(ROUTES.LISTING(id));
  }

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container className="py-6 sm:py-10 max-w-[860px]">
          <header className="mb-6 sm:mb-8">
            <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium mb-2">
              Continue your draft
            </div>
            <h1
              className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-ink tracking-[-0.02em]"
              style={{ textWrap: 'balance' }}
            >
              Resume your listing
            </h1>
            <p className="text-[14px] text-muted mt-1.5">
              We saved everything you entered last time. Edit anything, then submit when ready.
            </p>
          </header>

          <ListingForm
            listingId={listing.id}
            initialValues={listing}
            returnPath={ROUTES.EDIT_LISTING(listing.id)}
          />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
