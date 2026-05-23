// Static option sets and validation rules for the listing intake form.
// Source of truth: frently-docs/FORM_FIELDS.md. Keep in sync with that file.

// --- Step 1: Property Basics ---

export const PROPERTY_TYPES = [
  'Condo/Apt',
  'Row/Townhouse',
  'Semi-Detached',
  'Detached',
  'Other',
] as const;

export const STYLES = [
  'Apartment',
  'Loft',
  '2-Storey',
  'Bungalow',
  'Backsplit',
  'Other',
] as const;

export const OWNERSHIP_TYPES = ['Condominium', 'Freehold', 'None'] as const;

export const STOREYS_MIN = 1;
export const STOREYS_MAX = 4;

// --- Step 2: Lease Details ---

export const LEASE_TERMS = [
  '12 Months',
  '6 Months',
  'Month-to-Month',
  'Other',
] as const;

export const UTILITIES_OPTIONS = [
  'Hydro',
  'Heat',
  'Water',
  'Internet',
  'Cable TV',
  'Central Air',
  'Parking',
  'None',
] as const;

// --- Step 3: Property Details ---

export const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5+'] as const;

export const BATHROOM_OPTIONS = ['1', '1.5', '2', '2.5', '3', '3+'] as const;

export const PARKING_SPACES_MIN = 0;
export const PARKING_SPACES_MAX = 4;

export const PARKING_TYPES = [
  'Underground',
  'Surface',
  'Street',
  'None',
] as const;

// Condo-specific (shown only when is_condo = true)
export const CONDO_FEE_INCLUDES_OPTIONS = [
  'Water',
  'Hydro',
  'Heat',
  'Central Air',
  'Building Insurance',
  'Parking',
  'Internet',
  'Cable TV',
  'Common Elements',
] as const;

// --- Step 4: Description & Photos ---

export const DESCRIPTION_MAX_CHARS = 2000;
export const DESCRIPTION_MIN_CHARS = 50;

export const PHOTOS_MIN = 1;
export const PHOTOS_MAX = 25;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024; // 10MB
export const PHOTO_ACCEPTED_TYPES = ['image/jpeg', 'image/png'] as const;

// --- Validation rules (see FORM_FIELDS.md "Validation Rules") ---

export const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

export const RENT_MIN = 500;
export const RENT_MAX = 50000;

// --- Multi-step form definition ---

export const LISTING_STEPS = [
  { step: 1, key: 'basics', label: 'Property Basics' },
  { step: 2, key: 'lease', label: 'Lease Details' },
  { step: 3, key: 'details', label: 'Property Details' },
  { step: 4, key: 'media', label: 'Description & Photos' },
  { step: 5, key: 'review', label: 'Review & Submit' },
] as const;

export const TOTAL_STEPS = LISTING_STEPS.length;

// Option-derived value unions, for use in form value types.
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type Style = (typeof STYLES)[number];
export type OwnershipType = (typeof OWNERSHIP_TYPES)[number];
export type LeaseTerm = (typeof LEASE_TERMS)[number];
export type Utility = (typeof UTILITIES_OPTIONS)[number];
export type BedroomOption = (typeof BEDROOM_OPTIONS)[number];
export type BathroomOption = (typeof BATHROOM_OPTIONS)[number];
export type ParkingType = (typeof PARKING_TYPES)[number];
export type CondoFeeInclude = (typeof CONDO_FEE_INCLUDES_OPTIONS)[number];
