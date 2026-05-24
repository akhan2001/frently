// Per-step Zod schemas for the landlord listing form (6 steps now).
// `stepFields` mirrors the keys so the parent form can call
// react-hook-form's `trigger(stepFields[step])` before advancing.

import { z } from 'zod';
import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  CONDO_FEE_INCLUDES,
  CONDO_AMENITIES,
  DESCRIPTION_MAX_CHARS,
  DESCRIPTION_MIN_CHARS,
  INCLUSIONS,
  LEASE_REQUIREMENTS,
  LEASE_TERMS,
  LOCKER_TYPES,
  BALCONY_TYPES,
  OWNERSHIP_TYPES,
  PARKING_SPACES_MAX,
  PARKING_SPACES_MIN,
  PARKING_TYPES,
  PAYMENT_METHODS,
  PHOTOS_MAX,
  PHOTOS_MIN,
  PORTION_OF_PROPERTY,
  POSTAL_CODE_REGEX,
  PROPERTY_TYPES,
  RENT_MAX,
  RENT_MIN,
  STOREYS_MAX,
  STOREYS_MIN,
  STYLES,
  UTILITIES,
} from '@/constants/listing';

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// --- Step 1 — General (property only) ---
export const step1Schema = z.object({
  property_type: z.enum(PROPERTY_TYPES, { message: 'Required' }),
  style: z.enum(STYLES, { message: 'Required' }),
  storeys: z
    .number({ message: 'Required' })
    .int()
    .min(STOREYS_MIN, `Min ${STOREYS_MIN}`)
    .max(STOREYS_MAX, `Max ${STOREYS_MAX}`),
  ownership_type: z.enum(OWNERSHIP_TYPES, { message: 'Required' }),
  garage: z.enum(['Yes', 'No'], { message: 'Required' }),
  is_condo: z.boolean(),
  building_name: z.string().trim().optional(),
  condo_corp_number: z.string().trim().optional(),
});

// --- Step 2 — Address ---
export const step2Schema = z.object({
  street_number: z.string().trim().min(1, 'Required'),
  street_name: z.string().trim().min(1, 'Required'),
  unit_number: z.string().trim().optional(),
  city: z.string().trim().min(1, 'Required'),
  postal_code: z.string().trim().regex(POSTAL_CODE_REGEX, 'Format: A1A 1A1'),
  cross_street: z.string().trim().optional(),
});

// --- Step 3 — Lease ---
export const step3Schema = z.object({
  rent_amount: z
    .number({ message: 'Required' })
    .min(RENT_MIN, `Min $${RENT_MIN}`)
    .max(RENT_MAX, `Max $${RENT_MAX.toLocaleString()}`),
  available_date: z
    .string()
    .min(1, 'Required')
    .refine((s) => s >= todayIso(), 'Must be today or later'),
  lease_term: z.enum(LEASE_TERMS, { message: 'Required' }),
  is_furnished: z.boolean(),
  pets_allowed: z.boolean(),
  smoking_allowed: z.boolean(),
  utilities_included: z.array(z.enum(UTILITIES)).min(1, 'Pick at least one (or None)'),
  lease_requirements: z.array(z.enum(LEASE_REQUIREMENTS)).default([]),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  portion_of_property: z.enum(PORTION_OF_PROPERTY).optional(),
  inclusions: z.array(z.enum(INCLUSIONS)).default([]),
  exclusions: z.string().trim().optional(),
});

// --- Step 4 — Details ---
// parking_type required when parking_spaces > 0; condo block required when
// is_condo. is_condo is set in Step 1 so we read it from form state.
export const step4Schema = z
  .object({
    bedrooms: z.enum(BEDROOM_OPTIONS, { message: 'Required' }),
    bathrooms: z.enum(BATHROOM_OPTIONS, { message: 'Required' }),
    sqft_total: z.number().int().positive().optional(),
    parking_spaces: z
      .number({ message: 'Required' })
      .int()
      .min(PARKING_SPACES_MIN)
      .max(PARKING_SPACES_MAX),
    parking_type: z.enum(PARKING_TYPES).optional(),

    // Condo fields — only validated when is_condo === true (refine below).
    is_condo: z.boolean().optional(),
    condo_fee: z.number().positive().optional(),
    condo_fee_includes: z.array(z.enum(CONDO_FEE_INCLUDES)).default([]),
    condo_amenities: z.array(z.enum(CONDO_AMENITIES)).default([]),
    management_company: z.string().trim().optional(),
    management_phone: z.string().trim().optional(),
    locker: z.boolean().optional(),
    locker_type: z.enum(LOCKER_TYPES).optional(),
    locker_number: z.string().trim().optional(),
    balcony: z.enum(BALCONY_TYPES).optional(),
  })
  .refine((v) => v.parking_spaces === 0 || !!v.parking_type, {
    message: 'Pick a parking type',
    path: ['parking_type'],
  })
  .refine((v) => !v.is_condo || typeof v.condo_fee === 'number', {
    message: 'Required for condos',
    path: ['condo_fee'],
  })
  .refine(
    (v) => !v.is_condo || (v.condo_fee_includes && v.condo_fee_includes.length > 0),
    {
      message: 'Pick at least one',
      path: ['condo_fee_includes'],
    },
  );

// --- Step 5 — Media ---
export const step5Schema = z.object({
  public_remarks: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN_CHARS, `At least ${DESCRIPTION_MIN_CHARS} characters`)
    .max(DESCRIPTION_MAX_CHARS, `Max ${DESCRIPTION_MAX_CHARS} characters`),
  photo_urls: z
    .array(z.string().url())
    .min(PHOTOS_MIN, `Add at least ${PHOTOS_MIN} photo`)
    .max(PHOTOS_MAX, `Max ${PHOTOS_MAX} photos`),
});

// Field names per step.
export const stepFields = {
  1: [
    'property_type',
    'style',
    'storeys',
    'ownership_type',
    'garage',
    'is_condo',
    'building_name',
    'condo_corp_number',
  ],
  2: [
    'street_number',
    'street_name',
    'unit_number',
    'city',
    'postal_code',
    'cross_street',
  ],
  3: [
    'rent_amount',
    'available_date',
    'lease_term',
    'is_furnished',
    'pets_allowed',
    'smoking_allowed',
    'utilities_included',
    'lease_requirements',
    'payment_method',
    'portion_of_property',
    'inclusions',
    'exclusions',
  ],
  4: [
    'bedrooms',
    'bathrooms',
    'sqft_total',
    'parking_spaces',
    'parking_type',
    'condo_fee',
    'condo_fee_includes',
    'condo_amenities',
    'management_company',
    'management_phone',
    'locker',
    'locker_type',
    'locker_number',
    'balcony',
  ],
  5: ['public_remarks', 'photo_urls'],
} as const;
