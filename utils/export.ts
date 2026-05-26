import * as XLSX from 'xlsx';
import type { Listing } from '@/types/listing';

// --------------------------------------------------------
// PUBLIC API
// --------------------------------------------------------

export function exportAllListings(
  listings: (Listing & { landlord_name?: string; landlord_email?: string })[],
  filename = 'frently-all-listings',
): void {
  const rows = listings.map((l) => flattenListing(l));
  const ws = XLSX.utils.json_to_sheet(rows);
  applyColumnWidths(ws, rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'All Listings');

  // Separate sheets by status
  const statuses = [
    'draft',
    'pending',
    'in_review',
    'ready_for_mls',
    'live',
    'expired',
    'withdrawn',
  ] as const;
  for (const status of statuses) {
    const filtered = listings.filter((l) => l.status === status);
    if (filtered.length === 0) continue;
    const statusRows = filtered.map((l) => flattenListing(l));
    const statusWs = XLSX.utils.json_to_sheet(statusRows);
    applyColumnWidths(statusWs, statusRows);
    const sheetName = status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    XLSX.utils.book_append_sheet(wb, statusWs, sheetName);
  }

  XLSX.writeFile(wb, `${filename}-${formatDateForFilename(new Date())}.xlsx`);
}

export function exportSingleListing(
  listing: Listing & { landlord_name?: string; landlord_email?: string },
  filename?: string,
): void {
  const wb = XLSX.utils.book_new();
  const address = [
    listing.street_number,
    listing.street_name,
    listing.unit_number,
  ]
    .filter(Boolean)
    .join(' ');

  // Sheet 1: Summary
  const summaryRows: (string | number | null | undefined)[][] = [
    ['Field', 'Value'],
    ['Listing ID', listing.id],
    ['Status', listing.status],
    ['Landlord Name', listing.landlord_name ?? ''],
    ['Landlord Email', listing.landlord_email ?? ''],
    ['Address', address],
    ['City', listing.city ?? ''],
    ['Province', listing.province ?? 'ON'],
    ['Postal Code', listing.postal_code ?? ''],
    ['Rent', listing.rent_amount ? `$${listing.rent_amount}/mo` : ''],
    ['Deposit', listing.deposit_amount ? `$${listing.deposit_amount}` : ''],
    ['Available Date', listing.available_date ?? ''],
    ['Lease Term', listing.lease_term ?? ''],
    ['Bedrooms', listing.bedrooms ?? ''],
    ['Bathrooms', listing.bathrooms ?? ''],
    ['Sqft Total', listing.sqft_total ?? ''],
    ['Submitted At', listing.submitted_at ?? ''],
    ['Agent Reviewed At', listing.agent_reviewed_at ?? ''],
    ['Ready At', listing.ready_at ?? ''],
    ['Brokerage ID', listing.brokerage_id ?? 'CAS984'],
    ['Commission', listing.commission ? `$${listing.commission}` : '$1.00'],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  summaryWs['!cols'] = [{ wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Sheet 2: General & Address
  appendSection(
    wb,
    buildSectionRows([
      ['Property Type', listing.property_type],
      ['Property Sub-Type', listing.property_sub_type],
      ['Style', listing.style],
      ['Storeys', listing.storeys],
      ['Ownership Type', listing.ownership_type],
      ['Garage', listing.garage],
      ['Is Condo', listing.is_condo ? 'Yes' : 'No'],
      ['Street Number', listing.street_number],
      ['Street Name', listing.street_name],
      ['Unit Number', listing.unit_number],
      ['City', listing.city],
      ['Province', listing.province],
      ['Postal Code', listing.postal_code],
      ['Cross Street', listing.cross_street],
      ['Municipality', listing.municipality],
      ['Region', listing.region],
      ['Neighbourhood', listing.neighbourhood],
      ['Direction Pre', listing.direction_pre],
      ['Direction Suf', listing.direction_suf],
    ]),
    'General & Address',
  );

  // Sheet 3: Lease
  appendSection(
    wb,
    buildSectionRows([
      [
        'Rent Amount',
        listing.rent_amount ? `$${listing.rent_amount}` : '',
      ],
      [
        'Deposit Amount',
        listing.deposit_amount ? `$${listing.deposit_amount}` : '',
      ],
      ['Available Date', listing.available_date],
      ['Lease Term', listing.lease_term],
      ['Furnished', listing.is_furnished ? 'Yes' : 'No'],
      ['Pets Allowed', listing.pets_allowed ? 'Yes' : 'No'],
      ['Smoking Allowed', listing.smoking_allowed ? 'Yes' : 'No'],
      ['Utilities Included', arrayToString(listing.utilities_included)],
      ['Lease Requirements', arrayToString(listing.lease_requirements)],
      ['Payment Method', listing.payment_method],
      ['Portion of Property', listing.portion_of_property],
      ['Inclusions', arrayToString(listing.inclusions)],
      ['Exclusions', listing.exclusions],
    ]),
    'Lease',
  );

  // Sheet 4: Condo & Common Elements
  appendSection(
    wb,
    buildSectionRows([
      [
        'Condo Fee',
        listing.condo_fee ? `$${listing.condo_fee}/mo` : 'N/A',
      ],
      ['Condo Fee Includes', arrayToString(listing.condo_fee_includes)],
      ['Condo Amenities', arrayToString(listing.condo_amenities)],
      ['Management Company', listing.management_company],
      ['Management Phone', listing.management_phone],
      ['Locker', listing.locker ? 'Yes' : 'No'],
      ['Locker Type', listing.locker_type],
      ['Locker Number', listing.locker_number],
      ['Balcony', listing.balcony],
      ['Building Name', listing.building_name],
      ['Condo Corp Number', listing.condo_corp_number],
    ]),
    'Condo & Common Elements',
  );

  // Sheet 5: Property & Legal
  appendSection(
    wb,
    buildSectionRows([
      ['PIN', listing.pin],
      ['ARN', listing.arn],
      ['Legal Description', listing.legal_desc],
      ['Zoning', listing.zoning],
      ['Frontage', listing.frontage],
      ['Lot Depth', listing.lot_depth],
      ['Lot Size Area', listing.lot_size_area],
      ['Lot Shape', listing.lot_shape],
      ['Lot Size Source', listing.lot_size_source],
      ['Property Access', listing.property_access],
      ['Restrictions', arrayToString(listing.restrictions)],
      ['Site Plan Approval', listing.site_plan_approval ? 'Yes' : 'No'],
      ['School District', listing.school_district],
      ['School Board', listing.school_board],
      ['Elementary School', listing.elementary_school],
      ['High School', listing.high_school],
      ['Age Range', listing.age_range],
      ['Year Built', listing.year_built],
    ]),
    'Property & Legal',
  );

  // Sheet 6: Map
  appendSection(
    wb,
    buildSectionRows([
      ['Latitude', listing.latitude],
      ['Longitude', listing.longitude],
    ]),
    'Map',
  );

  // Sheet 7: Brokerage
  appendSection(
    wb,
    buildSectionRows([
      ['Brokerage ID', listing.brokerage_id ?? 'CAS984'],
      [
        'Commission',
        listing.commission ? `$${listing.commission}` : '$1.00',
      ],
      ['Realtor ID', listing.realtor_id],
      ['Realtor Name', listing.realtor_name],
      ['Co-Realtor ID', listing.co_realtor_id],
      ['Co-Realtor Name', listing.co_realtor_name],
      ['Commencement Date', listing.commencement_date],
      ['Expiry Date', listing.expiry_date],
      ['Holdover Days', listing.holdover_days],
      ['Lockbox', listing.lockbox ? 'Yes' : 'No'],
      ['Lockbox Type', listing.lockbox_type],
      ['Lockbox Serial', listing.lockbox_serial],
      ['Lockbox Location', listing.lockbox_location],
      ['Sign on Property', listing.sign_on_property ? 'Yes' : 'No'],
      ['Showing System', listing.showing_system],
      ['Showing Requirements', listing.showing_requirements],
      ['Showing Remarks', listing.showing_remarks],
      ['Buyer Brokerage Comp', listing.buyer_brokerage_comp],
      ['Representation Type', listing.representation_type],
      ['Virtual Tour URL', listing.virtual_tour_url],
      ['Virtual Tour URL 2', listing.virtual_tour_url_2],
      ['Unbranded Tour URL', listing.unbranded_tour_url],
      ['Unbranded Tour URL 2', listing.unbranded_tour_url_2],
      ['Feature Sheet URL', listing.feature_sheet_url],
      ['Consent Photos', listing.consent_photos ? 'Yes' : 'No'],
      ['Consent Advertise', listing.consent_advertise ? 'Yes' : 'No'],
      ['Holding Offers', listing.holding_offers ? 'Yes' : 'No'],
      ['Pre-Emptive Offers', listing.pre_emptive_offers ? 'Yes' : 'No'],
    ]),
    'Brokerage',
  );

  // Sheet 8: Exterior
  appendSection(
    wb,
    buildSectionRows([
      [
        'Construction Materials',
        arrayToString(listing.construction_materials),
      ],
      ['Roof', listing.roof],
      ['Water Source', listing.water_source],
      ['Services', arrayToString(listing.services)],
      ['Driveway Type', listing.driveway_type],
      ['Parking Spaces', listing.parking_spaces],
      ['Parking Type', listing.parking_type],
      ['Garage Type', listing.garage_type],
      ['Driveway Spaces', listing.driveway_spaces],
      ['Total Parking', listing.total_parking],
      ['Pool', listing.pool],
      ['Topography', arrayToString(listing.topography)],
      ['Area Features', arrayToString(listing.area_features)],
      ['Waterfront', listing.waterfront ? 'Yes' : 'No'],
      ['Waterfront Type', listing.waterfront_type],
      ['Exterior Features', arrayToString(listing.exterior_features)],
    ]),
    'Exterior',
  );

  // Sheet 9: Interior
  appendSection(
    wb,
    buildSectionRows([
      ['Bedrooms', listing.bedrooms],
      ['Bathrooms', listing.bathrooms],
      ['Sqft Above Grade', listing.sqft_above],
      ['Sqft Below Grade', listing.sqft_below],
      ['Sqft Total', listing.sqft_total],
      ['Interior Features', arrayToString(listing.interior_features)],
      ['Security Features', arrayToString(listing.security_features)],
      ['Basement Type', listing.basement_type],
      ['Basement Finish', listing.basement_finish],
      ['Basement Features', arrayToString(listing.basement_features)],
      ['Heating Type', arrayToString(listing.heating_type)],
      ['Cooling Type', arrayToString(listing.cooling_type)],
      ['Fireplace Count', listing.fireplace_count],
      ['Fireplace Features', arrayToString(listing.fireplace_features)],
      ['Laundry Features', arrayToString(listing.laundry_features)],
      ['Under Contract/Rental', arrayToString(listing.under_contract)],
    ]),
    'Interior',
  );

  // Sheet 10: Rooms
  const roomsData = Array.isArray(listing.rooms) ? listing.rooms : [];
  const roomHeaders = [
    'Level',
    'Type',
    'Length Ft',
    'Length In',
    'Width Ft',
    'Width In',
    'Features',
  ];
  const roomDataRows = roomsData.map((r) => [
    r.level ?? '',
    r.type ?? '',
    r.length_ft ?? '',
    r.length_in ?? '',
    r.width_ft ?? '',
    r.width_in ?? '',
    Array.isArray(r.features) ? r.features.join(', ') : '',
  ]);
  const roomRows =
    roomDataRows.length > 0
      ? [roomHeaders, ...roomDataRows]
      : [roomHeaders, ['No rooms entered']];
  const roomsWs = XLSX.utils.aoa_to_sheet(roomRows);
  roomsWs['!cols'] = roomHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, roomsWs, 'Rooms');

  // Sheet 11: Auxiliary Buildings
  const auxData = Array.isArray(listing.auxiliary_buildings)
    ? listing.auxiliary_buildings
    : [];
  const auxHeaders = ['Type', 'Beds', 'Baths', 'Kitchens', 'Winterized'];
  const auxDataRows = auxData.map((a) => [
    a.type ?? '',
    a.beds ?? '',
    a.baths ?? '',
    a.kitchens ?? '',
    a.winterized ?? '',
  ]);
  const auxRows =
    auxDataRows.length > 0
      ? [auxHeaders, ...auxDataRows]
      : [auxHeaders, ['No auxiliary buildings']];
  const auxWs = XLSX.utils.aoa_to_sheet(auxRows);
  auxWs['!cols'] = auxHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, auxWs, 'Auxiliary Buildings');

  // Sheet 12: Remarks & Media
  appendSection(
    wb,
    buildSectionRows([
      ['Public Remarks', listing.public_remarks],
      ['Private Remarks', listing.private_remarks],
      ['Showing Remarks', listing.showing_remarks],
      ['Offer Remarks', listing.offer_remarks],
      ['Photo URLs', arrayToString(listing.photo_urls)],
    ]),
    'Remarks & Media',
  );

  const safeAddress = address
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  XLSX.writeFile(
    wb,
    `${filename ?? `frently-listing-${safeAddress}`}-${formatDateForFilename(new Date())}.xlsx`,
  );
}

// --------------------------------------------------------
// HELPERS
// --------------------------------------------------------

function flattenListing(
  l: Listing & { landlord_name?: string; landlord_email?: string },
): Record<string, unknown> {
  return {
    // Identity
    'Listing ID': l.id,
    Status: l.status,
    'Landlord Name': l.landlord_name ?? '',
    'Landlord Email': l.landlord_email ?? '',
    'Agent ID': l.agent_id ?? '',

    // Address
    'Street Number': l.street_number ?? '',
    'Street Name': l.street_name ?? '',
    Unit: l.unit_number ?? '',
    City: l.city ?? '',
    Province: l.province ?? 'ON',
    'Postal Code': l.postal_code ?? '',
    'Cross Street': l.cross_street ?? '',
    Municipality: l.municipality ?? '',
    Region: l.region ?? '',
    Neighbourhood: l.neighbourhood ?? '',

    // General
    'Property Type': l.property_type ?? '',
    'Sub-Type': l.property_sub_type ?? '',
    Style: l.style ?? '',
    Storeys: l.storeys ?? '',
    'Ownership Type': l.ownership_type ?? '',
    Garage: l.garage ?? '',
    'Is Condo': l.is_condo ? 'Yes' : 'No',

    // Lease
    Rent: l.rent_amount ?? '',
    Deposit: l.deposit_amount ?? '',
    'Available Date': l.available_date ?? '',
    'Lease Term': l.lease_term ?? '',
    Furnished: l.is_furnished ? 'Yes' : 'No',
    Pets: l.pets_allowed ? 'Yes' : 'No',
    Smoking: l.smoking_allowed ? 'Yes' : 'No',
    Utilities: arrayToString(l.utilities_included),
    'Lease Requirements': arrayToString(l.lease_requirements),
    'Payment Method': l.payment_method ?? '',
    'Portion of Property': l.portion_of_property ?? '',
    Inclusions: arrayToString(l.inclusions),
    Exclusions: l.exclusions ?? '',

    // Condo
    'Condo Fee': l.condo_fee ?? '',
    'Condo Fee Includes': arrayToString(l.condo_fee_includes),
    'Condo Amenities': arrayToString(l.condo_amenities),
    'Management Co': l.management_company ?? '',
    'Management Phone': l.management_phone ?? '',
    Locker: l.locker ? 'Yes' : 'No',
    'Locker Type': l.locker_type ?? '',
    'Locker Number': l.locker_number ?? '',
    Balcony: l.balcony ?? '',
    'Building Name': l.building_name ?? '',
    'Condo Corp #': l.condo_corp_number ?? '',

    // Legal
    PIN: l.pin ?? '',
    ARN: l.arn ?? '',
    'Legal Description': l.legal_desc ?? '',
    Zoning: l.zoning ?? '',
    Frontage: l.frontage ?? '',
    'Lot Depth': l.lot_depth ?? '',
    'Lot Size Area': l.lot_size_area ?? '',
    'Lot Shape': l.lot_shape ?? '',
    'Lot Size Source': l.lot_size_source ?? '',
    'Property Access': l.property_access ?? '',
    Restrictions: arrayToString(l.restrictions),
    'Site Plan Approval': l.site_plan_approval ? 'Yes' : 'No',
    'School District': l.school_district ?? '',
    'School Board': l.school_board ?? '',
    'Elementary School': l.elementary_school ?? '',
    'High School': l.high_school ?? '',
    'Age Range': l.age_range ?? '',
    'Year Built': l.year_built ?? '',

    // Map
    Latitude: l.latitude ?? '',
    Longitude: l.longitude ?? '',

    // Brokerage
    'Brokerage ID': l.brokerage_id ?? 'CAS984',
    Commission: l.commission ?? 1.0,
    'Realtor ID': l.realtor_id ?? '',
    'Realtor Name': l.realtor_name ?? '',
    'Co-Realtor ID': l.co_realtor_id ?? '',
    'Co-Realtor Name': l.co_realtor_name ?? '',
    'Commencement Date': l.commencement_date ?? '',
    'Expiry Date': l.expiry_date ?? '',
    'Holdover Days': l.holdover_days ?? '',
    Lockbox: l.lockbox ? 'Yes' : 'No',
    'Lockbox Type': l.lockbox_type ?? '',
    'Lockbox Serial': l.lockbox_serial ?? '',
    'Lockbox Location': l.lockbox_location ?? '',
    'Sign on Property': l.sign_on_property ? 'Yes' : 'No',
    'Showing System': l.showing_system ?? '',
    'Showing Requirements': l.showing_requirements ?? '',
    'Showing Remarks': l.showing_remarks ?? '',
    'Buyer Brokerage Comp': l.buyer_brokerage_comp ?? '',
    'Representation Type': l.representation_type ?? '',
    'Virtual Tour URL': l.virtual_tour_url ?? '',
    'Virtual Tour URL 2': l.virtual_tour_url_2 ?? '',
    'Unbranded Tour URL': l.unbranded_tour_url ?? '',
    'Unbranded Tour URL 2': l.unbranded_tour_url_2 ?? '',
    'Feature Sheet URL': l.feature_sheet_url ?? '',
    'Consent Photos': l.consent_photos ? 'Yes' : 'No',
    'Consent Advertise': l.consent_advertise ? 'Yes' : 'No',
    'Holding Offers': l.holding_offers ? 'Yes' : 'No',
    'Pre-Emptive Offers': l.pre_emptive_offers ? 'Yes' : 'No',

    // Exterior
    'Construction Materials': arrayToString(l.construction_materials),
    Roof: l.roof ?? '',
    'Water Source': l.water_source ?? '',
    Services: arrayToString(l.services),
    'Driveway Type': l.driveway_type ?? '',
    'Parking Spaces': l.parking_spaces ?? '',
    'Parking Type': l.parking_type ?? '',
    'Garage Type': l.garage_type ?? '',
    'Driveway Spaces': l.driveway_spaces ?? '',
    'Total Parking': l.total_parking ?? '',
    Pool: l.pool ?? '',
    Topography: arrayToString(l.topography),
    'Area Features': arrayToString(l.area_features),
    Waterfront: l.waterfront ? 'Yes' : 'No',
    'Waterfront Type': l.waterfront_type ?? '',
    'Exterior Features': arrayToString(l.exterior_features),

    // Interior
    Bedrooms: l.bedrooms ?? '',
    Bathrooms: l.bathrooms ?? '',
    'Sqft Above': l.sqft_above ?? '',
    'Sqft Below': l.sqft_below ?? '',
    'Sqft Total': l.sqft_total ?? '',
    'Interior Features': arrayToString(l.interior_features),
    'Security Features': arrayToString(l.security_features),
    'Basement Type': l.basement_type ?? '',
    'Basement Finish': l.basement_finish ?? '',
    'Basement Features': arrayToString(l.basement_features),
    'Heating Type': arrayToString(l.heating_type),
    'Cooling Type': arrayToString(l.cooling_type),
    'Fireplace Count': l.fireplace_count ?? '',
    'Fireplace Features': arrayToString(l.fireplace_features),
    'Laundry Features': arrayToString(l.laundry_features),
    'Under Contract': arrayToString(l.under_contract),

    // Rooms (flattened count only — detail in single export)
    'Room Count': Array.isArray(l.rooms) ? l.rooms.length : 0,
    'Aux Buildings Count': Array.isArray(l.auxiliary_buildings)
      ? l.auxiliary_buildings.length
      : 0,

    // Remarks
    'Public Remarks': l.public_remarks ?? '',
    'Private Remarks': l.private_remarks ?? '',
    'Offer Remarks': l.offer_remarks ?? '',
    'Photo Count': Array.isArray(l.photo_urls) ? l.photo_urls.length : 0,

    // Timestamps
    'Created At': l.created_at ?? '',
    'Submitted At': l.submitted_at ?? '',
    'Agent Reviewed At': l.agent_reviewed_at ?? '',
    'Ready At': l.ready_at ?? '',
  };
}

function buildSectionRows(
  pairs: [string, unknown][],
): [string, string][] {
  return [
    ['Field', 'Value'],
    ...pairs.map(([label, value]): [string, string] => [
      label,
      value === null || value === undefined ? '' : String(value),
    ]),
  ];
}

function appendSection(
  wb: XLSX.WorkBook,
  rows: [string, string][],
  sheetName: string,
): void {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

function arrayToString(val: string[] | null | undefined): string {
  if (!Array.isArray(val) || val.length === 0) return '';
  return val.join(', ');
}

function applyColumnWidths(
  ws: XLSX.WorkSheet,
  rows: Record<string, unknown>[],
): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  ws['!cols'] = headers.map((h) => ({
    wch: Math.min(Math.max(h.length + 2, 12), 40),
  }));
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0];
}
