"use client";

// Agent Part-2 form. Single long form split into labeled section cards
// (Legal / Map / Brokerage / Exterior / Interior / Rooms / Aux / Remarks).
//
// Actions:
//   "Save Progress" → agentUpdateListing(), status flips to 'in_review'
//   "Mark Ready for MLS" → markReadyForMLS() with confirmation modal,
//     status flips to 'ready_for_mls', agent notification email fires.
//
// All multi-select arrays come from constants/listing.ts. No hard-coded
// strings live in this file.

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import {
  AGE_RANGES,
  AREA_FEATURES,
  BASEMENT_TYPES,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  CONSTRUCTION_MATERIALS,
  COOLING_TYPES,
  DRIVEWAY_TYPES,
  FIREPLACE_FEATURES,
  HEATING_TYPES,
  INTERIOR_FEATURES,
  LAUNDRY_FEATURES,
  LOCKBOX_TYPES,
  LOT_SHAPES,
  PARKING_TYPES,
  POOL_TYPES,
  PRIVATE_REMARKS_MAX,
  PROPERTY_ACCESS,
  RESTRICTIONS,
  SECURITY_FEATURES,
  SERVICES,
  SHOWING_SYSTEMS,
  TOPOGRAPHY,
  UNDER_CONTRACT,
  WATER_SOURCES,
} from '@/constants/listing';
import { DEFAULT_BUYER_BROKERAGE_COMP, MLS_SHOWING_REMARKS } from '@/constants/mls';
import { ROUTES } from '@/constants/routes';
import {
  agentUpdateListing,
  markReadyForMLS,
  withdrawListing,
} from '@/services/listings';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Toggle } from '@/components/ui/Toggle';
import { AuxBuildingsBuilder } from './AuxBuildingsBuilder';
import { RoomsBuilder } from './RoomsBuilder';
import type { AuxiliaryBuilding, Listing, ListingUpdate, RoomEntry } from '@/types/listing';

export function AdminListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const methods = useForm<ListingUpdate>({
    defaultValues: defaultsFromListing(listing),
  });

  async function onSave() {
    setError(null);
    setMsg(null);
    setSaving(true);
    try {
      const values = methods.getValues();
      // Server auto-promotes pending → in_review for agent saves; we don't
      // send status from the client (it's not in the API whitelist).
      await agentUpdateListing(listing.id, values);
      setMsg('Saved.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onWithdraw(): Promise<boolean> {
    setError(null);
    setMsg(null);
    setWithdrawing(true);
    try {
      await withdrawListing(listing.id);
      router.push(ROUTES.ADMIN);
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to withdraw');
      setWithdrawing(false);
      return false;
    }
  }

  /** Returns true on success, false on failure so the caller can close the modal. */
  async function onMarkReady(): Promise<boolean> {
    setError(null);
    setMsg(null);
    setSubmitting(true);
    try {
      const values = methods.getValues();
      await markReadyForMLS(listing.id, values);
      router.push(ROUTES.ADMIN);
      router.refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to mark ready');
      setSubmitting(false);
      return false;
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <LegalSection />
        <MapSection />
        <BrokerageSection />
        <ExteriorSection />
        <InteriorSection />
        <RoomsSection />
        <AuxSection />
        <RemarksSection />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {error}
          </div>
        )}
        {msg && (
          <div className="rounded-lg border border-forest/15 bg-forest-50 px-3 py-2 text-[13px] text-forest">
            {msg}
          </div>
        )}

        {/* Sticky save bar. Stacks vertically on mobile; flex-wrap keeps both
            buttons reachable at 375px. */}
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-2 sm:gap-3 flex-wrap bg-white/95 backdrop-blur border border-line rounded-2xl sm:rounded-full p-2 shadow-card">
          {/* Withdraw — destructive action, left-aligned to separate it visually */}
          <button
            type="button"
            onClick={() => setConfirmWithdraw(true)}
            disabled={saving || submitting || withdrawing || listing.status === 'withdrawn'}
            className="h-10 px-4 sm:px-5 rounded-full border border-red-200 bg-white text-[13px] font-medium text-red-600 hover:border-red-400 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {listing.status === 'withdrawn' ? 'Withdrawn' : 'Withdraw Listing'}
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || submitting || withdrawing}
              className="h-10 px-4 sm:px-5 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving && <SpinnerDark />}
              <span>{saving ? 'Saving…' : 'Save progress'}</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirm(true)}
              disabled={saving || submitting || withdrawing || listing.status === 'withdrawn'}
              className="h-10 px-4 sm:px-5 rounded-full bg-forest text-white text-[13px] font-semibold hover:bg-forest-700 transition disabled:opacity-70 inline-flex items-center gap-2"
            >
              {submitting && <Spinner />}
              <span>Mark ready for MLS</span>
            </button>
          </div>
        </div>
      </form>

      {confirm && (
        <ConfirmModal
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            const ok = await onMarkReady();
            if (!ok) setConfirm(false);
          }}
          submitting={submitting}
        />
      )}

      {confirmWithdraw && (
        <WithdrawModal
          onCancel={() => setConfirmWithdraw(false)}
          onConfirm={async () => {
            const ok = await onWithdraw();
            if (!ok) setConfirmWithdraw(false);
          }}
          withdrawing={withdrawing}
        />
      )}
    </FormProvider>
  );
}

/** Read the current listing into RHF defaults, with safe fallbacks. */
function defaultsFromListing(l: Listing): ListingUpdate {
  return {
    // Legal
    pin: l.pin ?? '',
    arn: l.arn ?? '',
    legal_desc: l.legal_desc ?? '',
    zoning: l.zoning ?? '',
    frontage: l.frontage ?? '',
    lot_depth: l.lot_depth ?? '',
    lot_size_area: l.lot_size_area ?? '',
    lot_shape: l.lot_shape ?? '',
    lot_size_source: l.lot_size_source ?? '',
    property_access: l.property_access ?? '',
    restrictions: l.restrictions ?? [],
    site_plan_approval: l.site_plan_approval,
    school_district: l.school_district ?? '',
    school_board: l.school_board ?? '',
    elementary_school: l.elementary_school ?? '',
    high_school: l.high_school ?? '',
    municipality: l.municipality ?? '',
    region: l.region ?? '',
    neighbourhood: l.neighbourhood ?? '',
    direction_pre: l.direction_pre ?? '',
    direction_suf: l.direction_suf ?? '',
    age_range: l.age_range ?? '',
    year_built: l.year_built ?? undefined,

    // Map
    latitude: l.latitude ?? undefined,
    longitude: l.longitude ?? undefined,

    // Brokerage
    realtor_id: l.realtor_id ?? '',
    realtor_name: l.realtor_name ?? '',
    co_realtor_id: l.co_realtor_id ?? '',
    co_realtor_name: l.co_realtor_name ?? '',
    commencement_date: l.commencement_date ?? '',
    expiry_date: l.expiry_date ?? '',
    holdover_days: l.holdover_days ?? undefined,
    lockbox: l.lockbox,
    lockbox_type: l.lockbox_type ?? '',
    lockbox_serial: l.lockbox_serial ?? '',
    lockbox_location: l.lockbox_location ?? '',
    sign_on_property: l.sign_on_property,
    showing_system: l.showing_system ?? '',
    showing_requirements: l.showing_requirements ?? 'All showing options: Yes',
    buyer_brokerage_comp: l.buyer_brokerage_comp ?? DEFAULT_BUYER_BROKERAGE_COMP,
    representation_type: l.representation_type ?? 'Brokerage',
    virtual_tour_url: l.virtual_tour_url ?? '',
    virtual_tour_url_2: l.virtual_tour_url_2 ?? '',
    unbranded_tour_url: l.unbranded_tour_url ?? '',
    unbranded_tour_url_2: l.unbranded_tour_url_2 ?? '',
    feature_sheet_url: l.feature_sheet_url ?? '',
    consent_photos: l.consent_photos,
    consent_advertise: l.consent_advertise,
    holding_offers: l.holding_offers,
    pre_emptive_offers: l.pre_emptive_offers,

    // Exterior
    construction_materials: l.construction_materials ?? [],
    roof: l.roof ?? '',
    water_source: l.water_source ?? '',
    services: l.services ?? [],
    driveway_type: l.driveway_type ?? '',
    parking_spaces: l.parking_spaces,
    parking_type: l.parking_type ?? '',
    garage_type: l.garage_type ?? '',
    driveway_spaces: l.driveway_spaces ?? undefined,
    total_parking: l.total_parking ?? undefined,
    pool: l.pool ?? '',
    topography: l.topography ?? [],
    area_features: l.area_features ?? [],
    waterfront: l.waterfront,
    waterfront_type: l.waterfront_type ?? '',
    exterior_features: l.exterior_features ?? [],

    // Interior — bedrooms/bathrooms pre-filled from Part 1
    bedrooms: l.bedrooms ?? '',
    bathrooms: l.bathrooms ?? '',
    sqft_above: l.sqft_above ?? undefined,
    sqft_below: l.sqft_below ?? undefined,
    sqft_total: l.sqft_total ?? undefined,
    interior_features: l.interior_features ?? [],
    security_features: l.security_features ?? [],
    basement_type: l.basement_type ?? '',
    basement_finish: l.basement_finish ?? '',
    basement_features: l.basement_features ?? [],
    heating_type: l.heating_type ?? [],
    cooling_type: l.cooling_type ?? [],
    fireplace_count: l.fireplace_count ?? 0,
    fireplace_features: l.fireplace_features ?? [],
    laundry_features: l.laundry_features ?? [],
    under_contract: l.under_contract ?? [],

    rooms: l.rooms ?? [],
    auxiliary_buildings: l.auxiliary_buildings ?? [],

    private_remarks: l.private_remarks ?? '',
    showing_remarks: l.showing_remarks ?? MLS_SHOWING_REMARKS,
    offer_remarks: l.offer_remarks ?? '',
  };
}

// --- Section components (use the shared form context) ---

function SectionCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white">
      <header className="px-5 py-3 border-b border-line">
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
        {hint && <p className="text-[12px] text-muted mt-0.5">{hint}</p>}
      </header>
      <div className="p-5 space-y-5">{children}</div>
    </section>
  );
}

function LegalSection() {
  return (
    <SectionCard title="Property / Legal">
      <UseCtx>
        {({ register, control }) => (
          <>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="PIN">
                <Input {...register('pin')} />
              </Field>
              <Field label="ARN">
                <Input {...register('arn')} />
              </Field>
            </div>
            <Field label="Legal description">
              <Textarea {...register('legal_desc')} rows={2} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Zoning">
                <Input {...register('zoning')} />
              </Field>
              <Field label="Lot size source">
                <Input {...register('lot_size_source')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Frontage">
                <Input {...register('frontage')} />
              </Field>
              <Field label="Lot depth">
                <Input {...register('lot_depth')} />
              </Field>
              <Field label="Lot size / area">
                <Input {...register('lot_size_area')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Lot shape">
                <Select options={LOT_SHAPES} {...register('lot_shape')} />
              </Field>
              <Field label="Property access">
                <Select options={PROPERTY_ACCESS} {...register('property_access')} />
              </Field>
            </div>
            <Field label="Restrictions">
              <Controller
                control={control}
                name="restrictions"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={RESTRICTIONS}
                  />
                )}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Site plan approval">
                <Controller
                  control={control}
                  name="site_plan_approval"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
              <Field label="Age range">
                <Select options={AGE_RANGES} {...register('age_range')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Year built">
                <Input type="number" {...register('year_built', { valueAsNumber: true })} />
              </Field>
              <Field label="Municipality">
                <Input {...register('municipality')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Region">
                <Input {...register('region')} />
              </Field>
              <Field label="Neighbourhood">
                <Input {...register('neighbourhood')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Direction prefix">
                <Input {...register('direction_pre')} placeholder="E, W, N, S" />
              </Field>
              <Field label="Direction suffix">
                <Input {...register('direction_suf')} placeholder="E, W, N, S" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="School district">
                <Input {...register('school_district')} />
              </Field>
              <Field label="School board">
                <Input {...register('school_board')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Elementary school">
                <Input {...register('elementary_school')} />
              </Field>
              <Field label="High school">
                <Input {...register('high_school')} />
              </Field>
            </div>
          </>
        )}
      </UseCtx>
    </SectionCard>
  );
}

function MapSection() {
  return (
    <SectionCard title="Map" hint="Map pin is mandatory for MLS submission.">
      <UseCtx>
        {({ register }) => (
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Latitude">
              <Input
                type="number"
                step="any"
                placeholder="43.6532"
                {...register('latitude', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Longitude">
              <Input
                type="number"
                step="any"
                placeholder="-79.3832"
                {...register('longitude', { valueAsNumber: true })}
              />
            </Field>
          </div>
        )}
      </UseCtx>
    </SectionCard>
  );
}

function BrokerageSection() {
  return (
    <SectionCard title="Brokerage">
      <UseCtx>
        {({ register, control }) => (
          <>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Realtor ID">
                <Input {...register('realtor_id')} />
              </Field>
              <Field label="Realtor name">
                <Input {...register('realtor_name')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Co-realtor ID">
                <Input {...register('co_realtor_id')} />
              </Field>
              <Field label="Co-realtor name">
                <Input {...register('co_realtor_name')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Commencement date">
                <Input type="date" {...register('commencement_date')} />
              </Field>
              <Field label="Expiry date">
                <Input type="date" {...register('expiry_date')} />
              </Field>
              <Field label="Holdover days">
                <Input type="number" {...register('holdover_days', { valueAsNumber: true })} />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Lockbox">
                <Controller
                  control={control}
                  name="lockbox"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
              <Field label="Lockbox type">
                <Select options={LOCKBOX_TYPES} {...register('lockbox_type')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Lockbox serial">
                <Input {...register('lockbox_serial')} />
              </Field>
              <Field label="Lockbox location">
                <Input {...register('lockbox_location')} />
              </Field>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Sign on property">
                <Controller
                  control={control}
                  name="sign_on_property"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
              <Field label="Showing system">
                <Select options={SHOWING_SYSTEMS} {...register('showing_system')} />
              </Field>
            </div>
            <Field
              label="Showing requirements"
              hint="All showing options set to Yes by default."
            >
              <Textarea rows={2} {...register('showing_requirements')} />
            </Field>
            <Field
              label="Buyer brokerage compensation"
              hint="Default $1.00 — landlord negotiates directly with realtor."
            >
              <Input {...register('buyer_brokerage_comp')} />
            </Field>
            <Field label="Representation type">
              <Input {...register('representation_type')} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Virtual tour URL">
                <Input type="url" {...register('virtual_tour_url')} />
              </Field>
              <Field label="Virtual tour URL 2">
                <Input type="url" {...register('virtual_tour_url_2')} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Unbranded tour URL">
                <Input type="url" {...register('unbranded_tour_url')} />
              </Field>
              <Field label="Unbranded tour URL 2">
                <Input type="url" {...register('unbranded_tour_url_2')} />
              </Field>
            </div>
            <Field label="Feature sheet URL">
              <Input type="url" {...register('feature_sheet_url')} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Consent: photos">
                <Controller
                  control={control}
                  name="consent_photos"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
              <Field label="Consent: advertise">
                <Controller
                  control={control}
                  name="consent_advertise"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Holding offers">
                <Controller
                  control={control}
                  name="holding_offers"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
              <Field label="Pre-emptive offers">
                <Controller
                  control={control}
                  name="pre_emptive_offers"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
            </div>
          </>
        )}
      </UseCtx>
    </SectionCard>
  );
}

function ExteriorSection() {
  return (
    <SectionCard title="Exterior">
      <UseCtx>
        {({ register, control }) => (
          <>
            <Field label="Construction materials">
              <Controller
                control={control}
                name="construction_materials"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={CONSTRUCTION_MATERIALS}
                  />
                )}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Roof">
                <Input {...register('roof')} />
              </Field>
              <Field label="Water source">
                <Select options={WATER_SOURCES} {...register('water_source')} />
              </Field>
            </div>
            <Field label="Services">
              <Controller
                control={control}
                name="services"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={SERVICES}
                  />
                )}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Driveway type">
                <Select options={DRIVEWAY_TYPES} {...register('driveway_type')} />
              </Field>
              <Field label="Driveway spaces">
                <Input
                  type="number"
                  {...register('driveway_spaces', { valueAsNumber: true })}
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Parking spaces">
                <Input
                  type="number"
                  {...register('parking_spaces', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Parking type">
                <Select options={PARKING_TYPES} {...register('parking_type')} />
              </Field>
              <Field label="Total parking">
                <Input
                  type="number"
                  {...register('total_parking', { valueAsNumber: true })}
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Garage type">
                <Input {...register('garage_type')} />
              </Field>
              <Field label="Pool">
                <Select options={POOL_TYPES} {...register('pool')} />
              </Field>
            </div>
            <Field label="Topography">
              <Controller
                control={control}
                name="topography"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={TOPOGRAPHY}
                  />
                )}
              />
            </Field>
            <Field label="Area features">
              <Controller
                control={control}
                name="area_features"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={AREA_FEATURES}
                  />
                )}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Waterfront">
                <Controller
                  control={control}
                  name="waterfront"
                  render={({ field }) => (
                    <Toggle value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
              <Field label="Waterfront type">
                <Input {...register('waterfront_type')} />
              </Field>
            </div>
            <Field label="Exterior features">
              <Input
                {...register('exterior_features.0' as 'exterior_features')}
                placeholder="Comma-separated list (free-form)"
                onChange={(e) => {
                  const arr = e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  e.target.value = arr.join(', ');
                }}
              />
            </Field>
          </>
        )}
      </UseCtx>
    </SectionCard>
  );
}

function InteriorSection() {
  return (
    <SectionCard title="Interior" hint="Bedrooms / bathrooms pre-filled from landlord — editable.">
      <UseCtx>
        {({ register, control }) => (
          <>
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Bedrooms">
                <Select options={BEDROOM_OPTIONS} {...register('bedrooms')} />
              </Field>
              <Field label="Bathrooms">
                <Select options={BATHROOM_OPTIONS} {...register('bathrooms')} />
              </Field>
              <Field label="Fireplace count">
                <Input
                  type="number"
                  {...register('fireplace_count', { valueAsNumber: true })}
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Sqft above grade">
                <Input
                  type="number"
                  {...register('sqft_above', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Sqft below grade">
                <Input
                  type="number"
                  {...register('sqft_below', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Sqft total">
                <Input
                  type="number"
                  {...register('sqft_total', { valueAsNumber: true })}
                />
              </Field>
            </div>

            <Field label="Interior features">
              <Controller
                control={control}
                name="interior_features"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={INTERIOR_FEATURES}
                  />
                )}
              />
            </Field>
            <Field label="Security features">
              <Controller
                control={control}
                name="security_features"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={SECURITY_FEATURES}
                  />
                )}
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Basement type">
                <Select options={BASEMENT_TYPES} {...register('basement_type')} />
              </Field>
              <Field label="Basement finish">
                <Input {...register('basement_finish')} />
              </Field>
            </div>
            <Field label="Basement features">
              <Controller
                control={control}
                name="basement_features"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={INTERIOR_FEATURES}
                  />
                )}
              />
            </Field>

            <Field label="Heating type">
              <Controller
                control={control}
                name="heating_type"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={HEATING_TYPES}
                  />
                )}
              />
            </Field>
            <Field label="Cooling type">
              <Controller
                control={control}
                name="cooling_type"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={COOLING_TYPES}
                  />
                )}
              />
            </Field>

            <Field label="Fireplace features">
              <Controller
                control={control}
                name="fireplace_features"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={FIREPLACE_FEATURES}
                  />
                )}
              />
            </Field>
            <Field label="Laundry features">
              <Controller
                control={control}
                name="laundry_features"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={LAUNDRY_FEATURES}
                  />
                )}
              />
            </Field>
            <Field label="Under contract (rental equipment)">
              <Controller
                control={control}
                name="under_contract"
                render={({ field }) => (
                  <CheckboxGroup
                    value={field.value as string[] | undefined}
                    onChange={field.onChange}
                    options={UNDER_CONTRACT}
                  />
                )}
              />
            </Field>
          </>
        )}
      </UseCtx>
    </SectionCard>
  );
}

function RoomsSection() {
  return (
    <SectionCard title="Rooms" hint="Every bedroom and bathroom needs an entry.">
      <UseCtx>
        {({ control }) => (
          <Controller
            control={control}
            name="rooms"
            render={({ field }) => (
              <RoomsBuilder
                value={(field.value as RoomEntry[] | undefined) ?? []}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </UseCtx>
    </SectionCard>
  );
}

function AuxSection() {
  return (
    <SectionCard title="Auxiliary buildings">
      <UseCtx>
        {({ control }) => (
          <Controller
            control={control}
            name="auxiliary_buildings"
            render={({ field }) => (
              <AuxBuildingsBuilder
                value={(field.value as AuxiliaryBuilding[] | undefined) ?? []}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </UseCtx>
    </SectionCard>
  );
}

function RemarksSection() {
  return (
    <SectionCard title="Remarks (agent)">
      <UseCtx>
        {({ register }) => (
          <>
            <Field label="Private remarks" hint={`Internal — not on MLS. Max ${PRIVATE_REMARKS_MAX}.`}>
              <Textarea
                rows={3}
                maxLength={PRIVATE_REMARKS_MAX}
                {...register('private_remarks')}
              />
            </Field>
            <Field label="Showing remarks" hint="Pre-filled with standard Vancor text — editable.">
              <Textarea rows={3} {...register('showing_remarks')} />
            </Field>
            <Field label="Offer remarks">
              <Textarea rows={2} {...register('offer_remarks')} />
            </Field>
          </>
        )}
      </UseCtx>
    </SectionCard>
  );
}

// Helper: avoid repeating useFormContext() inside every section JSX.
function UseCtx({
  children,
}: {
  children: (ctx: ReturnType<typeof useFormContext<ListingUpdate>>) => React.ReactNode;
}) {
  const ctx = useFormContext<ListingUpdate>();
  return <>{children(ctx)}</>;
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
    />
  );
}

function SpinnerDark() {
  return (
    <span
      aria-hidden
      className="w-3.5 h-3.5 border-2 border-ink/20 border-t-ink rounded-full animate-spin"
    />
  );
}

function ConfirmModal({
  onCancel,
  onConfirm,
  submitting,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white border border-line p-6 shadow-card">
        <h3 className="text-[16px] font-semibold text-ink">Mark this listing ready for MLS?</h3>
        <p className="mt-2 text-[13px] text-muted leading-relaxed">
          This locks the file as complete and notifies Vancor that it&apos;s ready for ITSO
          submission. Make sure rooms, lot, and brokerage fields are all set.
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="h-10 px-4 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="h-10 px-5 rounded-full bg-forest text-white text-[13px] font-semibold hover:bg-forest-700 disabled:opacity-70 inline-flex items-center gap-2"
          >
            {submitting && <Spinner />}
            <span>{submitting ? 'Marking…' : 'Mark ready'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({
  onCancel,
  onConfirm,
  withdrawing,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  withdrawing: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white border border-line p-6 shadow-card">
        <h3 className="text-[16px] font-semibold text-ink">Withdraw this listing?</h3>
        <p className="mt-2 text-[13px] text-muted leading-relaxed">
          The listing will be marked as <strong>Withdrawn</strong> and removed from the active
          queue. The landlord&apos;s data is preserved — this cannot be undone from the portal.
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={withdrawing}
            className="h-10 px-4 rounded-full border border-line bg-white text-[13px] font-medium text-ink hover:border-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={withdrawing}
            className="h-10 px-5 rounded-full bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 disabled:opacity-70 inline-flex items-center gap-2"
          >
            {withdrawing && <Spinner />}
            <span>{withdrawing ? 'Withdrawing…' : 'Withdraw Listing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
