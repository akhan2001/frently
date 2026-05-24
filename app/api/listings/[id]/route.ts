// PATCH /api/listings/[id] — update any subset of writable fields.
//
// Actions:
//   action: 'submit'       — landlord finalizes Part 1.
//     • status → 'pending'
//     • submitted_at = now()
//     • deposit_amount = rent_amount (server-side, last-month rule)
//     • fires sendVancorNotification + sendLandlordConfirmation
//
//   action: 'agent_ready'  — agent finalizes Part 2.
//     • status → 'ready_for_mls'
//     • agent_id = current user
//     • agent_reviewed_at = ready_at = now()
//     • fires sendAgentNotification
//
// Hardcoded MLS fields (commission, brokerage_id) are NOT in the whitelist —
// even a hand-rolled fetch can't override them.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import {
  sendAgentNotification,
  sendLandlordConfirmation,
  sendVancorNotification,
} from '@/services/email';
import type { Listing, ListingUpdate } from '@/types/listing';

const WRITABLE_FIELDS: (keyof ListingUpdate)[] = [
  // Part 1
  'property_type', 'property_sub_type', 'style', 'storeys', 'ownership_type',
  'garage', 'is_condo', 'street_number', 'street_name', 'unit_number',
  'city', 'province', 'postal_code', 'cross_street',
  'rent_amount', 'available_date', 'lease_term', 'is_furnished',
  'pets_allowed', 'smoking_allowed', 'utilities_included',
  'lease_requirements', 'payment_method', 'portion_of_property',
  'inclusions', 'exclusions',
  'condo_fee', 'condo_fee_includes', 'condo_amenities',
  'management_company', 'management_phone', 'locker', 'locker_type',
  'locker_number', 'balcony', 'building_name', 'condo_corp_number',
  'public_remarks', 'photo_urls',
  // Part 2 — Legal / Location
  'pin', 'arn', 'legal_desc', 'zoning', 'frontage', 'lot_depth',
  'lot_size_area', 'lot_shape', 'lot_size_source', 'property_access',
  'restrictions', 'site_plan_approval', 'school_district', 'school_board',
  'elementary_school', 'high_school', 'municipality', 'region',
  'neighbourhood', 'direction_pre', 'direction_suf',
  // Map
  'latitude', 'longitude',
  // Brokerage
  'realtor_id', 'realtor_name', 'co_realtor_id', 'co_realtor_name',
  'commencement_date', 'expiry_date', 'holdover_days',
  'lockbox', 'lockbox_type', 'lockbox_serial', 'lockbox_location',
  'sign_on_property', 'showing_system', 'showing_requirements',
  'buyer_brokerage_comp', 'representation_type',
  'virtual_tour_url', 'virtual_tour_url_2',
  'unbranded_tour_url', 'unbranded_tour_url_2', 'feature_sheet_url',
  'consent_photos', 'consent_advertise', 'holding_offers',
  'pre_emptive_offers',
  // Exterior
  'construction_materials', 'roof', 'water_source', 'services',
  'driveway_type', 'parking_spaces', 'parking_type', 'garage_type',
  'driveway_spaces', 'total_parking', 'pool', 'topography', 'area_features',
  'waterfront', 'waterfront_type', 'exterior_features',
  // Interior
  'bedrooms', 'bathrooms', 'sqft_above', 'sqft_below', 'sqft_total',
  'interior_features', 'security_features', 'basement_type',
  'basement_finish', 'basement_features', 'heating_type', 'cooling_type',
  'fireplace_count', 'fireplace_features', 'laundry_features',
  'under_contract', 'age_range', 'year_built',
  // Rooms + Aux + Remarks
  'rooms', 'auxiliary_buildings',
  'private_remarks', 'showing_remarks', 'offer_remarks',
];

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | (Partial<ListingUpdate> & { action?: 'submit' | 'agent_ready' })
    | null;
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const update: Record<string, unknown> = {};
  for (const key of WRITABLE_FIELDS) {
    if (key in body) update[key] = body[key];
  }
  update.updated_at = new Date().toISOString();

  // --- Action: landlord submit ---
  if (body.action === 'submit') {
    update.status = 'pending';
    update.submitted_at = new Date().toISOString();

    if (typeof update.rent_amount === 'number') {
      update.deposit_amount = update.rent_amount;
    } else {
      const { data: existing } = await supabase
        .schema('frently')
        .from('listings')
        .select('rent_amount')
        .eq('id', id)
        .single();
      if (existing?.rent_amount != null) update.deposit_amount = existing.rent_amount;
    }
  }

  // --- Action: agent ready ---
  if (body.action === 'agent_ready') {
    update.status = 'ready_for_mls';
    update.agent_id = user.id;
    const now = new Date().toISOString();
    update.agent_reviewed_at = now;
    update.ready_at = now;
  } else if (!body.action) {
    // No explicit action — if an agent is editing a still-pending listing,
    // auto-promote it to 'in_review' so the dashboard counters reflect that
    // work has started. Landlords don't get this branch (RLS + role check).
    const { data: actor } = await supabase
      .schema('frently')
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: 'landlord' | 'agent' }>();
    if (actor?.role === 'agent') {
      const { data: current } = await supabase
        .schema('frently')
        .from('listings')
        .select('status')
        .eq('id', id)
        .maybeSingle<{ status: string }>();
      if (current?.status === 'pending') {
        update.status = 'in_review';
        update.agent_id = user.id;
      }
    }
  }

  const { data: updated, error } = await supabase
    .schema('frently')
    .from('listings')
    .update(update)
    .eq('id', id)
    .select('*')
    .single<Listing>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // --- Fire emails after the row commits, but don't fail the request if Resend errors. ---
  try {
    if (body.action === 'submit') {
      const { data: profile } = await supabase
        .schema('frently')
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      const landlordEmail = user.email ?? '';
      await Promise.allSettled([
        sendVancorNotification(updated, profile, landlordEmail),
        sendLandlordConfirmation(updated, profile, landlordEmail),
      ]);
    } else if (body.action === 'agent_ready') {
      await sendAgentNotification(updated);
    }
  } catch (err) {
    console.error('[api/listings PATCH] email send failed', err);
  }

  return NextResponse.json(updated);
}
