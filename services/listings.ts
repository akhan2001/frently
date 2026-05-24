// Client-side listing service.
// Writes go through API routes so server logic (email triggers, status
// transitions) can hook in once. Reads use the browser Supabase client
// directly — RLS handles scoping (landlords see own, agents see all).

import { createClient } from '@/lib/supabase';
import type { Listing, ListingUpdate } from '@/types/listing';

/** POST /api/listings — create a draft row for the current user. */
export async function createListing(): Promise<{ id: string }> {
  const res = await fetch('/api/listings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to create listing');
  }
  return res.json();
}

/**
 * PATCH /api/listings/[id] — partial update.
 * `action: 'submit'` → status='pending', submitted_at, deposit_amount=rent_amount, fire emails.
 * `action: 'agent_ready'` → status='ready_for_mls', agent_reviewed_at, fire agent email.
 */
export async function updateListing(
  id: string,
  data: ListingUpdate,
  action?: 'submit' | 'agent_ready',
): Promise<Listing> {
  const res = await fetch(`/api/listings/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(action ? { ...data, action } : data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to update listing');
  }
  return res.json();
}

/** Landlord submit. Server stamps deposit_amount = rent_amount. */
export function submitListing(id: string, data: ListingUpdate = {}) {
  return updateListing(id, data, 'submit');
}

/** Agent patches Part 2 fields. */
export function agentUpdateListing(id: string, data: ListingUpdate) {
  return updateListing(id, data);
}

/** Agent finalizes — flips to ready_for_mls and fires the Vancor email. */
export function markReadyForMLS(id: string, data: ListingUpdate = {}) {
  return updateListing(id, data, 'agent_ready');
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle<Listing>();
  if (error) throw error;
  return data;
}

/** RLS scopes to auth.uid() for landlords. */
export async function getListingsByUser(): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Listing[];
}

/** Agent-only — RLS lets agents read every row. */
export async function getAllListings(): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Listing[];
}
