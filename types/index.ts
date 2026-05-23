// Barrel for shared application types.

export * from './listing';

/** A row in the `profiles` table (extends Supabase auth.users). */
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}
