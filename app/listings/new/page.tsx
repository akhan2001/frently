"use client";

// /listings/new — protected route (see proxy.ts). On mount we POST a draft
// listing so the multi-step form has an id to PATCH from step 1 onwards.
import { useEffect, useState } from 'react';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ListingForm } from '@/components/listing/form/ListingForm';
import { createListing } from '@/services/listings';

export default function NewListingPage() {
  const [listingId, setListingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createListing()
      .then(({ id }) => {
        if (!cancelled) setListingId(id);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to start listing');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container className="py-10 max-w-[860px]">
          <header className="mb-8">
            <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium mb-2">
              New listing
            </div>
            <h1
              className="text-[28px] sm:text-[32px] font-bold text-ink tracking-[-0.02em]"
              style={{ textWrap: 'balance' }}
            >
              List your rental on MLS
            </h1>
            <p className="text-[14px] text-muted mt-1.5">
              We&apos;ll save your progress after each step. You can come back any time.
            </p>
          </header>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </div>
          ) : !listingId ? (
            <div className="text-[13px] text-muted">Preparing your draft…</div>
          ) : (
            <ListingForm listingId={listingId} />
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
