// Listing card used on both landlord and agent dashboards.
//
// Shows:
//   • full address
//   • rent, formatted as $X,XXX/mo
//   • status badge
//   • submitted date — or "Draft" when not submitted yet
//   • optional `rightMeta` (e.g. landlord email on the agent dashboard)
//   • action buttons:
//       - landlord card:  View → /listings/[id]   + Edit if status='draft'
//       - agent card:     Review → /admin/listings/[id]  (passed in via `actions`)
//
// The card is no longer a single <Link>; explicit buttons live on the right.
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/listing/StatusBadge';
import type { Listing } from '@/types/listing';

function fmtAddress(
  l: Pick<Listing, 'street_number' | 'street_name' | 'unit_number' | 'city' | 'province'>,
) {
  const line1 = [l.street_number, l.street_name].filter(Boolean).join(' ');
  const unit = l.unit_number ? `, Unit ${l.unit_number}` : '';
  const locality = [l.city, l.province].filter(Boolean).join(', ');
  return [line1 ? line1 + unit : null, locality].filter(Boolean).join(' · ') || 'Untitled draft';
}

function fmtSubmittedDate(listing: Listing) {
  if (!listing.submitted_at) return 'Draft';
  return new Date(listing.submitted_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ListingCard({
  listing,
  variant = 'landlord',
  rightMeta,
  emphasized = false,
}: {
  listing: Listing;
  /** 'landlord' (default) shows View + Edit; 'agent' shows Review. */
  variant?: 'landlord' | 'agent';
  /** Extra meta line below address — e.g. landlord email on the agent dashboard. */
  rightMeta?: string;
  /** Visually elevate the card (used for pending rows on the agent dashboard). */
  emphasized?: boolean;
}) {
  const photo = listing.photo_urls?.[0];
  const isDraft = listing.status === 'draft';

  return (
    <article
      className={
        'bg-white border rounded-2xl overflow-hidden transition ' +
        (emphasized ? 'border-amber-300 ring-2 ring-amber-200/60' : 'border-line')
      }
    >
      <div className="flex gap-4 p-4 items-stretch">
        <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-page shrink-0">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 ph-stripes flex items-center justify-center">
              <span className="ph-label text-[9px]">no photo</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[14.5px] font-semibold text-ink truncate tracking-tight">
                {fmtAddress(listing)}
              </div>
              {rightMeta && (
                <div className="text-[12px] text-muted mt-0.5 truncate" title={rightMeta}>
                  {rightMeta}
                </div>
              )}
            </div>
            <StatusBadge status={listing.status} />
          </div>

          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <span className="text-[16px] font-bold text-forest tracking-tight">
                {listing.rent_amount ? `$${listing.rent_amount.toLocaleString()}` : '$—'}
              </span>
              <span className="text-[12px] text-muted"> /mo</span>
            </div>
            <span className="text-[11px] text-muted">{fmtSubmittedDate(listing)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 justify-center shrink-0">
          {variant === 'agent' ? (
            <Link
              href={ROUTES.ADMIN_LISTING(listing.id)}
              className="h-9 px-4 rounded-full bg-forest text-white text-[12.5px] font-semibold hover:bg-forest-700 transition inline-flex items-center justify-center"
            >
              Review
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.LISTING(listing.id)}
                className="h-9 px-4 rounded-full border border-line bg-white text-[12.5px] font-medium text-ink hover:border-muted transition inline-flex items-center justify-center"
              >
                View
              </Link>
              {isDraft && (
                <Link
                  href={ROUTES.EDIT_LISTING(listing.id)}
                  className="h-9 px-4 rounded-full bg-forest text-white text-[12.5px] font-semibold hover:bg-forest-700 transition inline-flex items-center justify-center"
                >
                  Edit
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
