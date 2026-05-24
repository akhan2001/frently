// GET /api/admin/listings — agent-only. Returns every listing plus the
// owning landlord's email (and name, if set).
//
// Why a server route: agents can read frently.listings via RLS, but they
// CANNOT read frently.profiles (own-row-only policy) or auth.users (hidden
// entirely). To enrich with email/name we need the service role, which is
// strictly server-side.
//
// The route always verifies the caller's role server-side before unlocking
// the admin client.

import { NextResponse } from 'next/server';
import { createAdminClient, hasServiceRole } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { Listing } from '@/types/listing';

export type AdminListingsResponse = {
  listings: Array<Listing & { landlord_email?: string; landlord_name?: string }>;
  /** false when SUPABASE_SERVICE_ROLE_KEY is not configured — UI degrades. */
  enriched: boolean;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Role gate. Defense-in-depth on top of the proxy.
  const { data: actor } = await supabase
    .schema('frently')
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: 'landlord' | 'agent' }>();
  if (actor?.role !== 'agent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Pull all listings via RLS (agents_see_all_listings).
  const { data: listings, error } = await supabase
    .schema('frently')
    .from('listings')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = hasServiceRole();
  if (!enriched || !listings || listings.length === 0) {
    return NextResponse.json<AdminListingsResponse>({
      listings: (listings ?? []) as AdminListingsResponse['listings'],
      enriched,
    });
  }

  // Enrich with landlord email + name via service role.
  const admin = createAdminClient();
  const userIds = Array.from(new Set(listings.map((l) => (l as Listing).user_id)));

  // Profile names from frently.profiles.
  const { data: profiles } = await admin
    .schema('frently')
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);
  const nameById = new Map<string, string>(
    (profiles ?? []).map((p: { id: string; full_name: string | null }) => [
      p.id,
      p.full_name ?? '',
    ]),
  );

  // Emails — auth.users isn't queryable, but admin.listUsers is.
  // Page through it; for MVP volumes one page is plenty.
  const emailById = new Map<string, string>();
  try {
    const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 200 });
    for (const u of usersPage?.users ?? []) {
      if (u.id && u.email && userIds.includes(u.id)) emailById.set(u.id, u.email);
    }
  } catch (e) {
    console.warn('[api/admin/listings] listUsers failed', e);
  }

  const enrichedList = (listings as Listing[]).map((l) => ({
    ...l,
    landlord_email: emailById.get(l.user_id),
    landlord_name: nameById.get(l.user_id) || undefined,
  }));

  return NextResponse.json<AdminListingsResponse>({
    listings: enrichedList,
    enriched: true,
  });
}
