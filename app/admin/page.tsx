"use client";

// Agent dashboard — every listing in the system, with counters, filter tabs,
// and Pending listings visually prioritized (sorted first + highlighted ring).
// Sign out lives in the global Nav.

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ListingCard } from '@/components/listing/ListingCard';
import { IconDownload } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { exportAllListings } from '@/utils/export';
import type { AdminListingsResponse } from '@/app/api/admin/listings/route';
import type { Listing, ListingStatus } from '@/types/listing';

type AdminListing = AdminListingsResponse['listings'][number];

type FilterKey = 'all' | ListingStatus;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_review', label: 'In review' },
  { key: 'ready_for_mls', label: 'Ready for MLS' },
  { key: 'live', label: 'Live' },
  { key: 'withdrawn', label: 'Withdrawn' },
];

// Pending first (it's what an agent needs to action), then the rest in the
// status order shown in the filters, then everything else by recency.
const STATUS_RANK: Record<ListingStatus, number> = {
  pending: 0,
  in_review: 1,
  ready_for_mls: 2,
  live: 3,
  draft: 4,
  expired: 5,
  withdrawn: 6,
};

export default function AdminDashboardPage() {
  const { user, profile, loading } = useUser();
  const [listings, setListings] = useState<AdminListing[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [error, setError] = useState<string | null>(null);
  const [enriched, setEnriched] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/admin/listings')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json())?.error ?? 'Failed to load');
        return r.json() as Promise<AdminListingsResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setListings(data.listings);
        setEnriched(data.enriched);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: listings?.length ?? 0,
      draft: 0,
      pending: 0,
      in_review: 0,
      ready_for_mls: 0,
      live: 0,
      expired: 0,
      withdrawn: 0,
    };
    for (const l of listings ?? []) c[l.status]++;
    return c;
  }, [listings]);

  const filtered = useMemo(() => {
    const rows = (listings ?? []).filter(
      (l) => filter === 'all' || l.status === filter,
    );
    // Sort pending first; tie-break by most recent activity.
    return [...rows].sort((a, b) => {
      const r = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (r !== 0) return r;
      const aT = new Date(a.submitted_at ?? a.updated_at ?? a.created_at).getTime();
      const bT = new Date(b.submitted_at ?? b.updated_at ?? b.created_at).getTime();
      return bT - aT;
    });
  }, [listings, filter]);

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container className="py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium mb-1.5">
                Vancor Admin
              </div>
              <h1
                className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-ink"
                style={{ textWrap: 'balance' }}
              >
                {loading ? '…' : `Hi, ${profile?.full_name ?? 'agent'}`}
              </h1>
              <p className="text-[14px] text-muted mt-1.5">
                All landlord submissions, grouped by status.
              </p>
            </div>
            {listings && listings.length > 0 && (
              <button
                onClick={() => exportAllListings(listings)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted transition shrink-0"
              >
                <IconDownload size={15} />
                Export All (.xlsx)
              </button>
            )}
          </div>

          <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Counter label="Pending" value={counts.pending} accent />
            <Counter label="In review" value={counts.in_review} />
            <Counter label="Ready for MLS" value={counts.ready_for_mls} />
            <Counter label="Live" value={counts.live} />
          </section>

          <nav aria-label="Filter listings" className="mt-8 flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn(
                  'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium border transition',
                  filter === f.key
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink border-line hover:border-muted',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[11px]',
                    filter === f.key ? 'bg-white/15 text-white' : 'bg-page text-muted',
                  )}
                >
                  {f.key === 'all' ? counts.all : counts[f.key]}
                </span>
              </button>
            ))}
          </nav>

          {!enriched && listings && listings.length > 0 && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              Landlord emails are hidden — set <code>SUPABASE_SERVICE_ROLE_KEY</code> in
              <code> .env.local</code> to enable.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </div>
          )}

          <section className="mt-6 grid gap-4">
            {listings == null ? (
              <SkeletonRows />
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-line rounded-2xl p-10 text-center">
                <h2 className="text-[16px] font-semibold text-ink">No listings here</h2>
                <p className="text-[13px] text-muted mt-1.5">
                  Try a different filter, or wait for a landlord to submit.
                </p>
              </div>
            ) : (
              filtered.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l as Listing}
                  variant="agent"
                  emphasized={l.status === 'pending'}
                  rightMeta={
                    l.landlord_email
                      ? l.landlord_name
                        ? `${l.landlord_name} · ${l.landlord_email}`
                        : l.landlord_email
                      : l.landlord_name || undefined
                  }
                />
              ))
            )}
          </section>

          <p className="mt-10 text-center text-[12px] text-muted">
            <Link href={ROUTES.HOME} className="hover:text-ink">
              Back to site
            </Link>
          </p>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

function Counter({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5',
        accent && value > 0 ? 'border-amber-300 ring-2 ring-amber-200/60' : 'border-line',
      )}
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 text-[28px] font-bold tracking-tight text-ink">{value}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-line rounded-2xl p-4 flex gap-4">
          <div className="w-28 h-20 rounded-lg bg-line" />
          <div className="flex-1 space-y-2">
            <span className="ph-bar h-3 w-1/3" />
            <span className="ph-bar h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}
