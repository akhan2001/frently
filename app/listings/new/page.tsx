"use client";

// /listings/new — protected route (see proxy.ts). On mount we POST a draft
// listing so the multi-step form has an id to PATCH from step 1 onwards.
//
// If the initial POST fails we surface a real error state with a Retry —
// never a "broken" empty form.
import { useCallback, useEffect, useState } from 'react';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ListingForm } from '@/components/listing/form/ListingForm';
import { ROUTES } from '@/constants/routes';
import { createListing } from '@/services/listings';

export default function NewListingPage() {
  const [listingId, setListingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Loading state is implicit: !error && !listingId. We never call
    // setState synchronously inside the effect — only inside the async
    // resolve/reject callbacks — to satisfy react-hooks/set-state-in-effect.
    let cancelled = false;
    createListing()
      .then(({ id }) => {
        if (!cancelled) setListingId(id);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to start a new listing.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    // Reset visible state and re-trigger the effect via attempt bump.
    setListingId(null);
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  const loading = !error && !listingId;

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container className="py-6 sm:py-10 max-w-[860px]">
          <header className="mb-6 sm:mb-8">
            <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium mb-2">
              New listing
            </div>
            <h1
              className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-ink tracking-[-0.02em]"
              style={{ textWrap: 'balance' }}
            >
              List your rental on MLS
            </h1>
            <p className="text-[14px] text-muted mt-1.5">
              We&apos;ll save your progress after each step. You can come back any time.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div role="alert" className="text-[13.5px] text-red-700">
                Couldn&apos;t start a new draft: {error}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={retry}
                  className="h-10 px-4 rounded-full bg-forest text-white text-[13px] font-semibold hover:bg-forest-700 transition"
                >
                  Try again
                </button>
                <a
                  href={ROUTES.DASHBOARD}
                  className="h-10 px-4 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted transition inline-flex items-center"
                >
                  Back to dashboard
                </a>
              </div>
            </div>
          ) : loading || !listingId ? (
            <div className="text-[13px] text-muted">Preparing your draft…</div>
          ) : (
            <ListingForm listingId={listingId} returnPath={ROUTES.NEW_LISTING} />
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
