"use client";

// Landlord dashboard. Lists their own submissions with status badges.
// Agents reaching here are redirected to /admin by the proxy.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ListingCard } from '@/components/listing/ListingCard';
import { IconArrowRight } from '@/components/icons';
import { useUser } from '@/hooks/useUser';
import { getListingsByUser } from '@/services/listings';
import type { Listing } from '@/types/listing';

export default function DashboardPage() {
  const { user, profile, loading } = useUser();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getListingsByUser()
      .then((rows) => {
        if (!cancelled) setListings(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName =
    profile?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : 'there');

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container className="py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-ink"
                style={{ textWrap: 'balance' }}
              >
                Welcome, {loading ? '…' : displayName}
              </h1>
              <p className="text-[14px] text-muted mt-1.5">
                Manage your rental listings and submissions.
              </p>
            </div>
            <Link
              href={ROUTES.NEW_LISTING}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-forest text-white text-[13px] font-semibold hover:bg-forest-700 transition"
            >
              Add listing <IconArrowRight size={14} color="#fff" />
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </div>
          )}

          <section aria-label="Your listings" className="mt-8">
            {listings == null ? (
              <ListingsSkeleton />
            ) : listings.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

function ListingsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white border border-line rounded-2xl p-4 flex gap-4">
          <div className="w-28 h-20 rounded-lg bg-line" />
          <div className="flex-1 space-y-2">
            <span className="ph-bar h-3 w-1/3" />
            <span className="ph-bar h-3 w-1/2" />
            <span className="ph-bar h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-line rounded-2xl p-12 text-center">
      <h2 className="text-[18px] font-semibold text-ink">No listings yet</h2>
      <p className="text-[14px] text-muted mt-1.5 max-w-[420px] mx-auto">
        Add your first listing and we&apos;ll get it onto MLS through Vancor Realty.
      </p>
      <Link
        href={ROUTES.NEW_LISTING}
        className="mt-6 inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-forest text-white text-[14px] font-semibold hover:bg-forest-700 transition"
      >
        Add your first listing <IconArrowRight size={15} color="#fff" />
      </Link>
    </div>
  );
}
