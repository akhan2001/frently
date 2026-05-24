// Profile reads/writes. All queries scoped to frently schema.
import { createClient } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/listing';

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .schema('frently')
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle<Profile>();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  data: Partial<Profile>,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .schema('frently')
    .from('profiles')
    .update(data)
    .eq('id', userId);
  if (error) throw error;
}

/** Convenience — current user's role, or null if not signed in. */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await getProfile(user.id);
  return profile?.role ?? null;
}
