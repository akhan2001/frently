// Service-role Supabase client. SERVER-ONLY — never import into any
// "use client" file. Bypasses RLS, so it must only be used in route handlers
// or server components that themselves verify the caller's role first.
import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set — required for admin operations.',
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True only when the service role key is configured. */
export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
