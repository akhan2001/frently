// Landlord-facing read-only listing detail. Server component — RLS lets the
// landlord read their own row only. (Agents can read everything, but they
// use /admin/listings/[id] instead.)
import { notFound, redirect } from 'next/navigation';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { StatusBadge } from '@/components/listing/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase-server';
import type { Listing } from '@/types/listing';

// Exact copy from Phase 4 spec — do not paraphrase.
const STATUS_EXPLAINER: Record<Listing['status'], string> = {
  draft: 'Complete your listing to submit it for MLS.',
  pending:
    'Submitted. Vancor Realty will review and list on MLS within 1 business day.',
  in_review: 'Being reviewed by Vancor Realty.',
  ready_for_mls: 'Ready for MLS submission. Vancor will submit shortly.',
  live: 'Your listing is live on MLS.',
  expired: 'This listing has expired.',
};

export default async function ListingDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { data: listing } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle<Listing>();
  if (!listing) notFound();

  const explainer = STATUS_EXPLAINER[listing.status];
  const address = fmtAddress(listing);

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Container className="py-10 max-w-[860px]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-[12px] uppercase tracking-[0.18em] text-forest font-medium mb-1.5">
                Your listing
              </div>
              <h1
                className="text-[26px] sm:text-[30px] font-bold tracking-[-0.02em] text-ink"
                style={{ textWrap: 'balance' }}
              >
                {address || 'Untitled listing'}
              </h1>
            </div>
            <StatusBadge status={listing.status} />
          </div>

          <section className="mt-6 rounded-2xl border border-line bg-white p-5">
            <p className="text-[14px] text-ink leading-relaxed">{explainer}</p>
          </section>

          {(listing.photo_urls ?? []).length > 0 && (
            <section className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listing.photo_urls.map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-line bg-page"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </section>
          )}

          <section className="mt-6 grid gap-4">
            <SummaryCard title="Property">
              <Row label="Type" value={joinDash(listing.property_type, listing.style)} />
              <Row label="Storeys" value={listing.storeys} />
              <Row label="Ownership" value={listing.ownership_type} />
              <Row label="Garage" value={listing.garage} />
              <Row label="Condo" value={fmtBool(listing.is_condo)} />
              {listing.is_condo && (
                <>
                  <Row label="Building" value={listing.building_name} />
                  <Row label="Condo corp #" value={listing.condo_corp_number} />
                </>
              )}
            </SummaryCard>

            <SummaryCard title="Lease">
              <Row
                label="Rent"
                value={
                  listing.rent_amount
                    ? `$${listing.rent_amount.toLocaleString()}/mo`
                    : undefined
                }
              />
              <Row label="Available" value={listing.available_date} />
              <Row label="Term" value={listing.lease_term} />
              <Row label="Furnished" value={fmtBool(listing.is_furnished)} />
              <Row label="Pets" value={fmtBool(listing.pets_allowed)} />
              <Row label="Smoking" value={fmtBool(listing.smoking_allowed)} />
              <Row label="Utilities" value={fmtList(listing.utilities_included)} />
              <Row label="Inclusions" value={fmtList(listing.inclusions)} />
            </SummaryCard>

            <SummaryCard title="Details">
              <Row label="Bedrooms" value={listing.bedrooms} />
              <Row label="Bathrooms" value={listing.bathrooms} />
              <Row label="Sqft" value={listing.sqft_total} />
              <Row
                label="Parking"
                value={
                  listing.parking_spaces > 0
                    ? `${listing.parking_spaces} (${listing.parking_type ?? '—'})`
                    : '0'
                }
              />
            </SummaryCard>

            {listing.public_remarks && (
              <SummaryCard title="Description">
                <p className="text-[13px] text-ink whitespace-pre-wrap leading-relaxed">
                  {listing.public_remarks}
                </p>
              </SummaryCard>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white overflow-hidden">
      <header className="px-5 py-3 border-b border-line">
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
      </header>
      <dl className="divide-y divide-line">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-5 py-2.5 grid grid-cols-[140px_1fr] gap-3 text-[13px]">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink whitespace-pre-wrap break-words">{value || '—'}</dd>
    </div>
  );
}

function fmtAddress(l: Listing) {
  const line1 = [l.street_number, l.street_name].filter(Boolean).join(' ');
  return [
    line1 + (l.unit_number ? `, Unit ${l.unit_number}` : ''),
    [l.city, l.province, l.postal_code].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(' · ');
}

function joinDash(...parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(' — ');
}
function fmtBool(v: boolean | null | undefined) {
  return v === true ? 'Yes' : v === false ? 'No' : undefined;
}
function fmtList(arr: string[] | null | undefined) {
  return arr && arr.length > 0 ? arr.join(', ') : undefined;
}
