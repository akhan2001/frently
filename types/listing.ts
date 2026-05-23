// Types for the `listings` table and the multi-step intake form.
// Row shape mirrors frently-docs/SCHEMA.md exactly. Form values use the
// stricter option unions from constants/listing.ts.

import type {
  BathroomOption,
  BedroomOption,
  CondoFeeInclude,
  LeaseTerm,
  OwnershipType,
  PropertyType,
  ParkingType,
  Style,
  Utility,
} from '@/constants/listing';

export type ListingStatus = 'draft' | 'pending' | 'live' | 'expired';

/**
 * A row in the `listings` table, exactly as stored.
 * Text columns are kept loose (`string | null`) since the database does not
 * constrain them to the form option sets.
 */
export interface Listing {
  id: string;
  user_id: string;
  status: ListingStatus;

  // Step 1: Property Basics
  property_type: string | null;
  property_sub_type: string | null;
  street_number: string | null;
  street_name: string | null;
  unit_number: string | null;
  city: string | null;
  province: string; // defaults to 'ON'
  postal_code: string | null;
  style: string | null;
  storeys: number | null;
  ownership_type: string | null;
  garage: string | null; // 'Yes' | 'No'
  is_condo: boolean;

  // Step 2: Lease Details
  rent_amount: number | null;
  deposit_amount: number | null; // auto = rent_amount
  lease_term: string | null;
  available_date: string | null; // ISO date (YYYY-MM-DD)
  is_furnished: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  utilities_included: string[] | null;

  // Step 3: Property Details
  bedrooms: number | null;
  bathrooms: number | null; // allows 1.5, 2.5
  sqft: number | null;
  parking_spaces: number;
  parking_type: string | null;
  locker: boolean;
  locker_number: string | null;

  // Condo-specific
  condo_fee: number | null;
  condo_fee_includes: string[] | null;
  management_company: string | null;
  management_phone: string | null;

  // Step 4: Description + Media
  public_remarks: string | null;
  photo_urls: string[] | null;

  // Hardcoded MLS fields (never exposed to landlord)
  commission: number;
  brokerage_id: string;
  showing_remarks: string;

  // Timestamps
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Fields the client may write when creating a new draft listing. */
export type ListingInsert = Partial<
  Omit<
    Listing,
    'id' | 'created_at' | 'updated_at' | 'commission' | 'brokerage_id' | 'showing_remarks'
  >
> & {
  user_id: string;
};

/** Partial update sent to PATCH /api/listings/[id]. */
export type ListingUpdate = Partial<Omit<Listing, 'id' | 'user_id' | 'created_at'>>;

/**
 * Form-facing values, with option fields constrained to their allowed sets.
 * Used by react-hook-form / zod on the client; mapped to a ListingUpdate on save.
 */
export interface ListingFormValues {
  // Step 1
  property_type?: PropertyType;
  style?: Style;
  street_number?: string;
  street_name?: string;
  unit_number?: string;
  city?: string;
  postal_code?: string;
  storeys?: number;
  ownership_type?: OwnershipType;
  garage?: 'Yes' | 'No';
  is_condo?: boolean;

  // Step 2
  rent_amount?: number;
  available_date?: string;
  lease_term?: LeaseTerm;
  is_furnished?: boolean;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  utilities_included?: Utility[];

  // Step 3
  bedrooms?: BedroomOption;
  bathrooms?: BathroomOption;
  sqft?: number;
  parking_spaces?: number;
  parking_type?: ParkingType;
  locker?: boolean;
  locker_number?: string;
  condo_fee?: number;
  condo_fee_includes?: CondoFeeInclude[];
  management_company?: string;
  management_phone?: string;

  // Step 4
  public_remarks?: string;
}
