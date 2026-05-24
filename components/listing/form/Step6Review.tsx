"use client";

// Step 6 — Review. Read-only summary grouped by section + Edit buttons
// that jump back to the relevant step. Legal authorization notice from
// constants/mls.ts. The final submit is wired by the parent ListingForm.
import type { ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { MLS_AUTHORIZATION_NOTICE } from '@/constants/mls';
import { IconChevronRight } from '@/components/icons';
import type { ListingUpdate } from '@/types/listing';

export function Step6Review({ goToStep }: { goToStep: (step: number) => void }) {
  const { control } = useFormContext<ListingUpdate>();
  const v = useWatch({ control }) as ListingUpdate;

  const line1 = [v.street_number, v.street_name].filter(Boolean).join(' ');
  const address = [
    line1 ? line1 + (v.unit_number ? `, Unit ${v.unit_number}` : '') : null,
    [v.city, 'ON', v.postal_code].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-5">
      <Section title="General" onEdit={() => goToStep(1)}>
        <Row label="Property" value={joinDash(v.property_type, v.style)} />
        <Row label="Storeys" value={v.storeys?.toString()} />
        <Row label="Ownership" value={v.ownership_type} />
        <Row label="Garage" value={v.garage} />
        <Row label="Condo" value={fmtBool(v.is_condo)} />
        {v.is_condo && <Row label="Building" value={v.building_name} />}
        {v.is_condo && <Row label="Condo corp #" value={v.condo_corp_number} />}
      </Section>

      <Section title="Address" onEdit={() => goToStep(2)}>
        <Row label="Address" value={address} />
        <Row label="Cross street" value={v.cross_street} />
      </Section>

      <Section title="Lease" onEdit={() => goToStep(3)}>
        <Row
          label="Rent"
          value={typeof v.rent_amount === 'number' ? `$${v.rent_amount.toLocaleString()}/mo` : undefined}
        />
        <Row label="Available" value={v.available_date} />
        <Row label="Term" value={v.lease_term} />
        <Row label="Furnished" value={fmtBool(v.is_furnished)} />
        <Row label="Pets" value={fmtBool(v.pets_allowed)} />
        <Row label="Smoking" value={fmtBool(v.smoking_allowed)} />
        <Row label="Utilities" value={fmtList(v.utilities_included)} />
        <Row label="Requirements" value={fmtList(v.lease_requirements)} />
        <Row label="Payment" value={v.payment_method} />
        <Row label="Portion" value={v.portion_of_property} />
        <Row label="Inclusions" value={fmtList(v.inclusions)} />
        <Row label="Exclusions" value={v.exclusions} />
      </Section>

      <Section title="Details" onEdit={() => goToStep(4)}>
        <Row label="Bedrooms" value={v.bedrooms} />
        <Row label="Bathrooms" value={v.bathrooms} />
        <Row label="Sqft" value={v.sqft_total?.toString()} />
        <Row
          label="Parking"
          value={
            v.parking_spaces && v.parking_spaces > 0
              ? `${v.parking_spaces} (${v.parking_type ?? '—'})`
              : '0'
          }
        />
        {v.is_condo && (
          <>
            <Row
              label="Condo fee"
              value={typeof v.condo_fee === 'number' ? `$${v.condo_fee.toLocaleString()}/mo` : undefined}
            />
            <Row label="Fee includes" value={fmtList(v.condo_fee_includes)} />
            <Row label="Amenities" value={fmtList(v.condo_amenities)} />
            <Row label="Management" value={v.management_company} />
            <Row label="Mgmt phone" value={v.management_phone} />
            <Row label="Locker" value={fmtBool(v.locker)} />
            {v.locker && <Row label="Locker type" value={v.locker_type} />}
            {v.locker && <Row label="Locker #" value={v.locker_number} />}
            <Row label="Balcony" value={v.balcony} />
          </>
        )}
      </Section>

      <Section title="Photos & description" onEdit={() => goToStep(5)}>
        <Row label="Description" value={v.public_remarks} />
        <Row label="Photos" value={`${v.photo_urls?.length ?? 0} uploaded`} />
      </Section>

      <div className="rounded-2xl border border-line bg-page p-5 text-[13px] text-body leading-relaxed">
        {MLS_AUTHORIZATION_NOTICE}
      </div>
    </div>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-line">
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[12.5px] text-forest font-medium inline-flex items-center gap-1 hover:underline"
        >
          Edit <IconChevronRight size={12} color="currentColor" />
        </button>
      </header>
      <dl className="divide-y divide-line">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="px-5 py-2.5 grid grid-cols-[140px_1fr] gap-3 text-[13px]">
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
