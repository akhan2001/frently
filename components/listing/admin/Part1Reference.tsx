// Agent-side read-only view of what the landlord submitted.
// Shown in the left column of /admin/listings/[id].
import type { ReactNode } from 'react';
import type { Listing } from '@/types/listing';

export function Part1Reference({ listing }: { listing: Listing }) {
  const line1 = [listing.street_number, listing.street_name].filter(Boolean).join(' ');
  const addressTop = [
    line1 + (listing.unit_number ? `, Unit ${listing.unit_number}` : ''),
    [listing.city, listing.province, listing.postal_code].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join('  ');

  return (
    <aside className="lg:sticky lg:top-20 space-y-4">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-forest font-medium mb-1.5">
          Landlord-submitted
        </div>
        <h2
          className="text-[18px] font-semibold text-ink tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          {addressTop || 'Untitled listing'}
        </h2>
      </header>

      {(listing.photo_urls ?? []).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {listing.photo_urls.slice(0, 6).map((url, i) => (
            <div
              key={url}
              className="relative aspect-[4/3] rounded-lg overflow-hidden border border-line bg-page"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <Card title="Property">
        <Row label="Type" value={joinDash(listing.property_type, listing.style)} />
        <Row label="Storeys" value={listing.storeys} />
        <Row label="Ownership" value={listing.ownership_type} />
        <Row label="Garage" value={listing.garage} />
        <Row label="Condo" value={fmtBool(listing.is_condo)} />
        {listing.is_condo && (
          <>
            <Row label="Building" value={listing.building_name} />
            <Row label="Condo corp" value={listing.condo_corp_number} />
          </>
        )}
      </Card>

      <Card title="Lease">
        <Row
          label="Rent"
          value={listing.rent_amount ? `$${listing.rent_amount.toLocaleString()}/mo` : undefined}
        />
        <Row
          label="Deposit"
          value={
            listing.deposit_amount
              ? `$${listing.deposit_amount.toLocaleString()}`
              : undefined
          }
        />
        <Row label="Available" value={listing.available_date} />
        <Row label="Term" value={listing.lease_term} />
        <Row label="Furnished" value={fmtBool(listing.is_furnished)} />
        <Row label="Pets" value={fmtBool(listing.pets_allowed)} />
        <Row label="Smoking" value={fmtBool(listing.smoking_allowed)} />
        <Row label="Utilities" value={fmtList(listing.utilities_included)} />
        <Row label="Requirements" value={fmtList(listing.lease_requirements)} />
        <Row label="Inclusions" value={fmtList(listing.inclusions)} />
        <Row label="Exclusions" value={listing.exclusions} />
        <Row label="Payment" value={listing.payment_method} />
        <Row label="Portion" value={listing.portion_of_property} />
      </Card>

      <Card title="Details">
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
        {listing.is_condo && (
          <>
            <Row
              label="Condo fee"
              value={
                listing.condo_fee ? `$${listing.condo_fee.toLocaleString()}/mo` : undefined
              }
            />
            <Row label="Fee includes" value={fmtList(listing.condo_fee_includes)} />
            <Row label="Amenities" value={fmtList(listing.condo_amenities)} />
            <Row label="Management" value={listing.management_company} />
            <Row label="Mgmt phone" value={listing.management_phone} />
            <Row label="Locker" value={fmtBool(listing.locker)} />
            <Row label="Locker type" value={listing.locker_type} />
            <Row label="Balcony" value={listing.balcony} />
          </>
        )}
      </Card>

      {listing.public_remarks && (
        <Card title="Description">
          <p className="px-4 py-3 text-[13px] text-ink whitespace-pre-wrap leading-relaxed">
            {listing.public_remarks}
          </p>
        </Card>
      )}
    </aside>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white overflow-hidden">
      <header className="px-4 py-2.5 border-b border-line">
        <h3 className="text-[12.5px] font-semibold text-ink uppercase tracking-[0.08em]">
          {title}
        </h3>
      </header>
      <dl className="divide-y divide-line">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="px-4 py-2 grid grid-cols-[110px_1fr] gap-2 text-[12.5px]">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink whitespace-pre-wrap break-words">{value || '—'}</dd>
    </div>
  );
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
