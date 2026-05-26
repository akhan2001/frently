// Mirrors frently.listings + frently.profiles exactly. Text columns stay
// loose (string | null) since SQL doesn't constrain them to option sets —
// the option unions in constants/listing.ts are used in the form-values
// type below.

export type UserRole = 'landlord' | 'agent';

export type ListingStatus =
  | 'draft'
  | 'pending'
  | 'in_review'
  | 'ready_for_mls'
  | 'live'
  | 'expired'
  | 'withdrawn';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

/** One entry in the rooms jsonb array. */
export interface RoomEntry {
  level: string;
  type: string;
  length_ft?: number;
  length_in?: number;
  width_ft?: number;
  width_in?: number;
  features?: string[];
}

/** One entry in the auxiliary_buildings jsonb array. */
export interface AuxiliaryBuilding {
  type: string;
  beds?: number;
  baths?: number;
  kitchens?: number;
  winterized?: 'Yes' | 'No' | 'Partially';
}

export interface Listing {
  id: string;
  user_id: string;
  agent_id: string | null;
  status: ListingStatus;

  // Part 1 — General
  property_type: string | null;
  property_sub_type: string | null;
  style: string | null;
  storeys: number | null;
  ownership_type: string | null;
  garage: string | null;
  is_condo: boolean;

  // Part 1 — Address
  street_number: string | null;
  street_name: string | null;
  unit_number: string | null;
  city: string | null;
  province: string;
  postal_code: string | null;
  cross_street: string | null;

  // Part 1 — Lease
  rent_amount: number | null;
  deposit_amount: number | null;
  available_date: string | null;
  lease_term: string | null;
  is_furnished: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  utilities_included: string[];
  lease_requirements: string[];
  payment_method: string | null;
  portion_of_property: string | null;
  inclusions: string[];
  exclusions: string | null;

  // Part 1 — Condo / Common Elements
  condo_fee: number | null;
  condo_fee_includes: string[];
  condo_amenities: string[];
  management_company: string | null;
  management_phone: string | null;
  locker: boolean;
  locker_type: string | null;
  locker_number: string | null;
  balcony: string | null;
  building_name: string | null;
  condo_corp_number: string | null;

  // Part 1 — Description + Media
  public_remarks: string | null;
  photo_urls: string[];

  // --- Part 2 — Property / Legal ---
  pin: string | null;
  arn: string | null;
  legal_desc: string | null;
  zoning: string | null;
  frontage: string | null;
  lot_depth: string | null;
  lot_size_area: string | null;
  lot_shape: string | null;
  lot_size_source: string | null;
  property_access: string | null;
  restrictions: string[];
  site_plan_approval: boolean;
  school_district: string | null;
  school_board: string | null;
  elementary_school: string | null;
  high_school: string | null;
  municipality: string | null;
  region: string | null;
  neighbourhood: string | null;
  direction_pre: string | null;
  direction_suf: string | null;

  // Part 2 — Map
  latitude: number | null;
  longitude: number | null;

  // Part 2 — Brokerage
  realtor_id: string | null;
  realtor_name: string | null;
  co_realtor_id: string | null;
  co_realtor_name: string | null;
  commencement_date: string | null;
  expiry_date: string | null;
  holdover_days: number | null;
  lockbox: boolean;
  lockbox_type: string | null;
  lockbox_serial: string | null;
  lockbox_location: string | null;
  sign_on_property: boolean;
  showing_system: string | null;
  showing_requirements: string | null;
  buyer_brokerage_comp: string | null;
  representation_type: string;
  virtual_tour_url: string | null;
  virtual_tour_url_2: string | null;
  unbranded_tour_url: string | null;
  unbranded_tour_url_2: string | null;
  feature_sheet_url: string | null;
  consent_photos: boolean;
  consent_advertise: boolean;
  holding_offers: boolean;
  pre_emptive_offers: boolean;

  // Part 2 — Exterior
  construction_materials: string[];
  roof: string | null;
  water_source: string | null;
  services: string[];
  driveway_type: string | null;
  parking_spaces: number;
  parking_type: string | null;
  garage_type: string | null;
  driveway_spaces: number | null;
  total_parking: number | null;
  pool: string | null;
  topography: string[];
  area_features: string[];
  waterfront: boolean;
  waterfront_type: string | null;
  exterior_features: string[];

  // Part 2 — Interior
  bedrooms: string | null;
  bathrooms: string | null;
  sqft_above: number | null;
  sqft_below: number | null;
  sqft_total: number | null;
  interior_features: string[];
  security_features: string[];
  basement_type: string | null;
  basement_finish: string | null;
  basement_features: string[];
  heating_type: string[];
  cooling_type: string[];
  fireplace_count: number;
  fireplace_features: string[];
  laundry_features: string[];
  under_contract: string[];
  age_range: string | null;
  year_built: number | null;

  // Part 2 — Rooms + Aux Buildings
  rooms: RoomEntry[];
  auxiliary_buildings: AuxiliaryBuilding[];

  // Part 2 — Remarks
  private_remarks: string | null;
  showing_remarks: string;
  offer_remarks: string | null;

  // Hardcoded MLS
  commission: number;
  brokerage_id: string;

  // Timestamps
  submitted_at: string | null;
  agent_reviewed_at: string | null;
  ready_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Subset writable by any authenticated user — server route whitelists this. */
export type ListingUpdate = Partial<Omit<Listing, 'id' | 'user_id' | 'created_at'>>;

/** Listing card shape for the dashboard list views. */
export type ListingCardData = Pick<
  Listing,
  | 'id'
  | 'status'
  | 'street_number'
  | 'street_name'
  | 'unit_number'
  | 'city'
  | 'province'
  | 'rent_amount'
  | 'photo_urls'
  | 'submitted_at'
  | 'created_at'
  | 'updated_at'
  | 'user_id'
>;
