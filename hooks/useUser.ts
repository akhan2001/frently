"use client";

// Client hook: current Supabase auth user + frently.profiles row.
// Re-fetches when the auth state changes (login, logout, token refresh).
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/types";

type State = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
};

export function useUser() {
  const [state, setState] = useState<State>({ user: null, profile: null, loading: true });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load(user: User | null) {
      if (!user) {
        if (!cancelled) setState({ user: null, profile: null, loading: false });
        return;
      }
      // All Frently tables live in the `frently` schema. .schema() is required
      // because the client defaults to `public`. Use maybeSingle() so a missing
      // profile row returns null instead of HTTP 406 — legacy accounts created
      // before the schema reset can land here without a profile.
      const { data: profile } = await supabase
        .schema("frently")
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle<Profile>();
      if (!cancelled) setState({ user, profile: profile ?? null, loading: false });
    }

    supabase.auth.getUser().then(({ data }) => load(data.user));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
