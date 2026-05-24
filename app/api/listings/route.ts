// POST /api/listings — creates a draft listing for the current user.
// Returns { id } so the client form can start patching that row immediately.
//
// Defensive: ensures a frently.profiles row exists for the caller before
// inserting. The handle_new_user() trigger only fires on NEW auth.users
// inserts, so accounts created before the schema was reset have no profile,
// which makes the RLS `(select role from profiles…) = 'landlord'` check
// fail with a confusing permission error.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Ensure the profile row exists. Pull from user_metadata where available.
  const meta = (user.user_metadata ?? {}) as { full_name?: string; phone?: string; role?: string };
  const { error: profileError } = await supabase
    .schema('frently')
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: meta.full_name ?? null,
        phone: meta.phone ?? null,
        role: meta.role === 'agent' ? 'agent' : 'landlord',
      },
      // ignoreDuplicates so an existing agent's role isn't downgraded to landlord
      // on subsequent POSTs. Equivalent to INSERT … ON CONFLICT (id) DO NOTHING.
      { onConflict: 'id', ignoreDuplicates: true },
    );
  if (profileError) {
    console.error('[POST /api/listings] profile upsert failed', profileError);
    return NextResponse.json(
      { error: `Profile setup failed: ${profileError.message}` },
      { status: 500 },
    );
  }

  // 2. Insert the draft. RLS now allows it because role='landlord' is present.
  const { data, error } = await supabase
    .schema('frently')
    .from('listings')
    .insert({ user_id: user.id })
    .select('id')
    .single();

  if (error) {
    console.error('[POST /api/listings] insert failed', error);
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: 500 },
    );
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
