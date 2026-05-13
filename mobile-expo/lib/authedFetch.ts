import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function createAuthedFetch(client: SupabaseClient = supabase) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const {
      data: { session },
    } = await client.auth.getSession();

    const headers = new Headers(init?.headers);
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return fetch(input, { ...init, headers });
  };
}
