"use client";

// Parent form for the landlord intake (6 steps).
// - currentStep (1..6) in local state (initialStep prop lets edit-page resume)
// - one react-hook-form instance shared with steps via FormProvider
// - "save as you go" — each Next click PATCHes only that step's payload
// - final submit (Step 6) PATCHes with action='submit' so the server
//   transitions status to 'pending', stamps submitted_at, and copies
//   rent_amount → deposit_amount (last-month rule).
//
// Error handling:
// - Validation errors stop the step from advancing (no PATCH fires).
// - PATCH errors keep the user on the current step with an inline toast.
// - Submit errors keep the user on Step 6 with the same inline toast.
// - 401 (session expired) → /login?redirectTo=<current path>.

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { FormProvider, useForm, type FieldPath } from 'react-hook-form';
import { LISTING_STEPS, TOTAL_STEPS } from '@/constants/listing';
import { DEFAULT_PROVINCE } from '@/constants/mls';
import { ROUTES } from '@/constants/routes';
import { stepFields } from '@/lib/validations';
import { submitListing, updateListing } from '@/services/listings';
import { IconArrowRight, IconChevronLeft } from '@/components/icons';
import { Step1General } from './Step1General';
import { Step2Address } from './Step2Address';
import { Step3Lease } from './Step3Lease';
import { Step4Details } from './Step4Details';
import { Step5Media } from './Step5Media';
import { Step6Review } from './Step6Review';
import { StepIndicator } from './StepIndicator';
import type { Listing, ListingUpdate } from '@/types/listing';

type StepKey = keyof typeof stepFields;

const DEFAULTS: ListingUpdate = {
  is_condo: false,
  is_furnished: false,
  pets_allowed: false,
  smoking_allowed: false,
  utilities_included: [],
  lease_requirements: [],
  inclusions: [],
  parking_spaces: 0,
  locker: false,
  condo_fee_includes: [],
  condo_amenities: [],
  photo_urls: [],
  province: DEFAULT_PROVINCE,
};

/** Detect Supabase/PostgREST or fetch 401s in error messages. */
function isAuthError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const m = e.message.toLowerCase();
  return (
    m.includes('unauthorized') ||
    m.includes('jwt expired') ||
    m.includes('not authenticated') ||
    m === '401'
  );
}

export function ListingForm({
  listingId,
  initialValues,
  initialStep = 1,
  /** Path used to build ?redirectTo if the session dies mid-edit. */
  returnPath,
}: {
  listingId: string;
  initialValues?: Partial<Listing> | ListingUpdate;
  initialStep?: number;
  returnPath?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<number>(initialStep);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<ListingUpdate>({
    mode: 'onTouched',
    defaultValues: mergeDefaults(initialValues),
  });

  function handleError(e: unknown, fallback: string) {
    if (isAuthError(e)) {
      const target =
        returnPath ??
        (typeof window !== 'undefined' ? window.location.pathname : ROUTES.NEW_LISTING);
      const url = `${ROUTES.LOGIN}?redirectTo=${encodeURIComponent(target)}`;
      router.push(url);
      return;
    }
    setError(e instanceof Error ? e.message : fallback);
  }

  const goNext = useCallback(async () => {
    setError(null);
    if (step < TOTAL_STEPS && stepFields[step as StepKey]) {
      const fields = stepFields[step as StepKey] as readonly FieldPath<ListingUpdate>[];
      const ok = await methods.trigger(fields as FieldPath<ListingUpdate>[]);
      if (!ok) return;
    }

    const values = methods.getValues();
    const payload = pickStepPayload(step, values);

    try {
      setSaving(true);
      if (Object.keys(payload).length > 0) {
        await updateListing(listingId, payload);
      }
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      handleError(e, 'Failed to save');
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, listingId, methods]);

  const goBack = useCallback(() => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /** Save current step's data and return to the dashboard without advancing. */
  const saveDraft = useCallback(async () => {
    setError(null);
    const values = methods.getValues();
    const payload = pickStepPayload(step, values);
    try {
      setSaving(true);
      if (Object.keys(payload).length > 0) {
        await updateListing(listingId, payload);
      }
      router.push(ROUTES.DASHBOARD);
    } catch (e) {
      handleError(e, 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, listingId, methods]);

  const goToStep = useCallback((s: number) => {
    setError(null);
    setStep(Math.min(Math.max(1, s), TOTAL_STEPS));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const onSubmit = methods.handleSubmit(async (values) => {
    setError(null);
    try {
      setSubmitting(true);
      // Flush Step 5's payload one last time, then submit.
      await submitListing(listingId, pickStepPayload(5, values));
      router.push(ROUTES.DASHBOARD);
      router.refresh();
    } catch (e) {
      handleError(e, 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  });

  const stepLabel = LISTING_STEPS[step - 1]?.label;
  const isLast = step === TOTAL_STEPS;
  const busy = saving || submitting;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) void onSubmit();
          else void goNext();
        }}
      >
        <StepIndicator current={step} />

        <div className="mt-8">
          <h2 className="text-[20px] sm:text-[22px] font-bold text-ink tracking-tight">
            {stepLabel}
          </h2>
        </div>

        <div className="mt-6">
          {step === 1 && <Step1General />}
          {step === 2 && <Step2Address />}
          {step === 3 && <Step3Lease />}
          {step === 4 && <Step4Details />}
          {step === 5 && <Step5Media listingId={listingId} />}
          {step === 6 && <Step6Review goToStep={goToStep} />}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || busy}
            className="h-11 px-4 sm:px-5 rounded-full border border-line bg-white text-[14px] font-medium text-ink hover:border-muted transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <IconChevronLeft size={14} color="currentColor" /> Back
          </button>

          <div className="flex items-center gap-2">
            {!isLast && (
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={busy}
                className="h-11 px-4 sm:px-5 rounded-full border border-line bg-white text-[14px] font-medium text-ink hover:border-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Draft
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="h-11 px-5 sm:px-6 rounded-full bg-forest text-white text-[14px] font-semibold hover:bg-forest-700 transition disabled:opacity-70 inline-flex items-center gap-2"
            >
              {busy && <Spinner />}
              <span>
                {isLast
                  ? submitting
                    ? 'Submitting…'
                    : 'Submit for MLS'
                  : saving
                    ? 'Saving…'
                    : 'Next'}
              </span>
              {!isLast && !busy && <IconArrowRight size={15} color="#fff" />}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
    />
  );
}

/** Merge caller's initialValues onto DEFAULTS while keeping nulls out of RHF. */
function mergeDefaults(
  init: Partial<Listing> | ListingUpdate | undefined,
): ListingUpdate {
  if (!init) return DEFAULTS;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(init)) {
    // RHF dislikes null where a string/number is expected — drop nulls so
    // DEFAULTS fills them in.
    if (v !== null && v !== undefined) cleaned[k] = v;
  }
  return { ...DEFAULTS, ...(cleaned as ListingUpdate) };
}

/** Pick the subset of form values belonging to a step. */
function pickStepPayload(step: number, v: ListingUpdate): ListingUpdate {
  const out: ListingUpdate = {};
  const set = <K extends keyof ListingUpdate>(k: K, val: ListingUpdate[K] | undefined) => {
    if (val !== undefined && val !== '') out[k] = val;
  };

  if (step === 1) {
    set('property_type', v.property_type);
    set('style', v.style);
    set('storeys', v.storeys);
    set('ownership_type', v.ownership_type);
    set('garage', v.garage);
    out.is_condo = v.is_condo ?? false;
    if (v.is_condo) {
      set('building_name', v.building_name);
      set('condo_corp_number', v.condo_corp_number);
    }
  }
  if (step === 2) {
    set('street_number', v.street_number);
    set('street_name', v.street_name);
    set('unit_number', v.unit_number);
    set('city', v.city);
    set('postal_code', v.postal_code);
    set('cross_street', v.cross_street);
    out.province = DEFAULT_PROVINCE;
  }
  if (step === 3) {
    set('rent_amount', v.rent_amount);
    set('available_date', v.available_date);
    set('lease_term', v.lease_term);
    out.is_furnished = v.is_furnished ?? false;
    out.pets_allowed = v.pets_allowed ?? false;
    out.smoking_allowed = v.smoking_allowed ?? false;
    set('utilities_included', v.utilities_included);
    set('lease_requirements', v.lease_requirements);
    set('payment_method', v.payment_method);
    set('portion_of_property', v.portion_of_property);
    set('inclusions', v.inclusions);
    set('exclusions', v.exclusions);
  }
  if (step === 4) {
    set('bedrooms', v.bedrooms);
    set('bathrooms', v.bathrooms);
    set('sqft_total', v.sqft_total);
    set('parking_spaces', v.parking_spaces);
    set('parking_type', v.parking_type);
    if (v.is_condo) {
      set('condo_fee', v.condo_fee);
      set('condo_fee_includes', v.condo_fee_includes);
      set('condo_amenities', v.condo_amenities);
      set('management_company', v.management_company);
      set('management_phone', v.management_phone);
      out.locker = v.locker ?? false;
      set('locker_type', v.locker_type);
      set('locker_number', v.locker_number);
      set('balcony', v.balcony);
    }
  }
  if (step === 5) {
    set('public_remarks', v.public_remarks);
    if (v.photo_urls) out.photo_urls = v.photo_urls;
  }
  return out;
}
