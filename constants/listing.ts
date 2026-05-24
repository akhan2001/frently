// All static option sets for the listing form (both landlord Part 1 and
// agent Part 2). Source of truth for every dropdown / multi-checkbox in the
// UI — never hard-code these strings inside a component.

// --- Landlord Part 1 ---

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
  '1 Storey',
  '2 Storey',
  'Bungalow',
  'Backsplit',
  'Other',
] as const;

export const OWNERSHIP_TYPES = ['Freehold/None', 'Condominium'] as const;

export const LEASE_TERMS = [
  '12 Months',
  '6 Months',
  'Month-to-Month',
  'Weekly',
  'Other',
] as const;

export const UTILITIES = [
  'Hydro',
  'Heat',
  'Water',
  'Internet',
  'Cable TV',
  'Central Air',
  'Natural Gas',
  'None',
] as const;

export const LEASE_REQUIREMENTS = [
  'Credit Check',
  'Income Verification',
  'Non-Smoking',
  'Lease Agreement',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Direct Withdrawal',
  'Certified Cheque',
  'Credit Card',
  'Other',
] as const;

export const PORTION_OF_PROPERTY = [
  'Entire Property',
  'Main',
  'Upper',
  'Lower',
  'Basement',
  'Ancillary Structure',
  'Other',
] as const;

export const INCLUSIONS = [
  'Fridge',
  'Stove',
  'Dishwasher',
  'Washer',
  'Dryer',
  'Microwave',
  'Built-in Microwave',
  'Central Vac',
  'Carbon Monoxide Detector',
  'Freezer',
  'Furniture',
  'Garage Door Opener',
  'Window Coverings',
  'None',
  'Negotiable',
] as const;

export const CONDO_FEE_INCLUDES = [
  'Water',
  'Hydro',
  'Heat',
  'Central Air',
  'Building Insurance',
  'Parking',
  'Internet',
  'Cable TV',
  'Common Elements',
  'Building Maintenance',
  'Property Management Fees',
  'Snow Removal',
  'Natural Gas',
  'Roof',
  'Windows',
  'Water Heater',
  'Doors',
] as const;

export const CONDO_AMENITIES = [
  'BBQs Permitted',
  'Business Centre',
  'Car Wash',
  'Club House',
  'Communal Waterfront',
  'Community BBQ',
  'Concierge',
  'Day Care',
  'Elevator',
  'Exercise Room',
  'Games Room',
  'Guest Suites',
  'Library',
  'Media Room',
  'Party Room',
  'Playground',
  'Pool',
  'Roof Top Deck/Garden',
  'Sauna',
  'Visitor Parking',
  'Tennis Court',
] as const;

export const LOCKER_TYPES = ['None', 'Common', 'Exclusive', 'In-Suite', 'Owned'] as const;
export const BALCONY_TYPES = ['None', 'Open', 'Juliette', 'Terrace', 'Enclosed'] as const;

export const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5+'] as const;
export const BATHROOM_OPTIONS = ['1', '1.5', '2', '2.5', '3', '3+'] as const;

// --- Agent Part 2 ---

export const CONSTRUCTION_MATERIALS = [
  'Brick',
  'Brick Veneer',
  'Vinyl Siding',
  'Stucco',
  'Wood',
  'Concrete Block',
  'Metal',
  'Log',
  'Board & Batten',
  'Other',
] as const;

export const WATER_SOURCES = [
  'Municipal',
  'Drilled Well',
  'Dug Well',
  'Community Well',
  'Well',
  'Unknown',
] as const;

export const PROPERTY_ACCESS = [
  'Paved Road',
  'Private Road',
  'ATV Only',
  'Municipal Road',
  'Other',
] as const;

export const PARKING_TYPES = [
  'Underground',
  'Surface',
  'Attached Garage',
  'Detached Garage',
  'Carport',
  'None',
] as const;

export const DRIVEWAY_TYPES = [
  'Private Single',
  'Private Double',
  'Mutual',
  'Interlock',
  'Asphalt',
  'None',
] as const;

export const HEATING_TYPES = [
  'Forced Air',
  'Baseboard',
  'Radiant',
  'Heat Pump',
  'Hot Water',
  'Space Heater',
  'Geothermal',
  'Other',
] as const;

export const COOLING_TYPES = ['Central Air', 'Wall Unit', 'None', 'Other'] as const;

export const BASEMENT_TYPES = [
  'None',
  'Full',
  'Partial',
  'Crawl Space',
  'Walk-Out',
  'Finished',
  'Unfinished',
] as const;

export const INTERIOR_FEATURES = [
  'Alarm System',
  'Carbon Monoxide Detector',
  'Central Vacuum',
  'Ceiling Fans',
  'Dishwasher',
  'Hot Tub',
  'In-Law Suite',
  'Jetted Bathtub',
  'Skylight',
  'Sump Pump',
  'Water Treatment',
  'Wet Bar',
] as const;

export const SECURITY_FEATURES = [
  'Alarm System',
  'Security Guard',
  'Smoke Detector',
  'Carbon Monoxide Detector',
  'Security Camera',
] as const;

export const TOPOGRAPHY = ['Flat', 'Hilly', 'Sloping', 'Terraced', 'Marsh', 'Rocky'] as const;

export const AREA_FEATURES = [
  'School Bus Route',
  'Schools',
  'Park',
  'Shopping Nearby',
  'Highway',
  'Greenbelt',
  'Marina',
  'River',
  'Arts Centre',
  'Dog Park',
] as const;

export const RESTRICTIONS = [
  'Easement',
  'Covenant',
  'Environmentally Protected',
  'Municipal Regulations',
  'None',
] as const;

export const SHOWING_SYSTEMS = ['TSB - List Brokerage', 'TSP - List Salesperson'] as const;

export const ROOM_TYPES = [
  'Kitchen',
  'Living Room',
  'Dining Room',
  'Primary Bedroom',
  'Bedroom',
  'Bathroom',
  'Den',
  'Office',
  'Laundry',
  'Sunroom',
  'Family Room',
  'Other',
] as const;

export const ROOM_LEVELS = [
  'Main',
  'Upper',
  'Lower',
  'Basement',
  'Ground',
  'Sub-Basement',
] as const;

export const LOT_SHAPES = ['Flat', 'Irregular', 'Rectangular', 'Pie-Shaped', 'Other'] as const;

export const FIREPLACE_FEATURES = [
  'Gas',
  'Propane',
  'Wood',
  'Electric',
  'Operational',
] as const;

export const UNDER_CONTRACT = [
  'Air Conditioner',
  'Water Heater',
  'Water Softener',
  'Propane Tank',
  'Security System',
  'Water Purification',
] as const;

export const AGE_RANGES = ['0-5', '6-15', '16-30', '31-50', '51-99', '100+', 'New'] as const;

export const SERVICES = [
  'Electricity',
  'Natural Gas',
  'Cable',
  'High Speed Internet',
  'Telephone',
  'Underground Wiring',
] as const;

export const LAUNDRY_FEATURES = ['In-Suite', 'Shared', 'Coin-Op', 'Ensuite', 'None'] as const;

export const POOL_TYPES = ['None', 'Inground', 'Above Ground'] as const;

export const LOCKBOX_TYPES = ['Call L&C', 'Included', 'Other'] as const;

export const WINTERIZED_OPTIONS = ['Yes', 'No', 'Partially'] as const;

export const AUX_BUILDING_TYPES = [
  'Coach House',
  'Cottage',
  'Garage',
  'Shed',
  'Workshop',
  'Other',
] as const;

// --- Validation rules (frently-docs/FORM_FIELDS.md) ---

export const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
export const RENT_MIN = 500;
export const RENT_MAX = 50000;
export const STOREYS_MIN = 1;
export const STOREYS_MAX = 4;
export const PARKING_SPACES_MIN = 0;
export const PARKING_SPACES_MAX = 4;
export const DESCRIPTION_MAX_CHARS = 2000;
export const DESCRIPTION_MIN_CHARS = 50;
export const PHOTOS_MIN = 1;
export const PHOTOS_MAX = 25;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_ACCEPTED_TYPES = ['image/jpeg', 'image/png'] as const;
export const PRIVATE_REMARKS_MAX = 2000;

// --- Multi-step landlord form ---

export const LISTING_STEPS = [
  { step: 1, key: 'general', label: 'General' },
  { step: 2, key: 'address', label: 'Address' },
  { step: 3, key: 'lease', label: 'Lease' },
  { step: 4, key: 'details', label: 'Details' },
  { step: 5, key: 'media', label: 'Photos' },
  { step: 6, key: 'review', label: 'Review' },
] as const;

export const TOTAL_STEPS = LISTING_STEPS.length;
