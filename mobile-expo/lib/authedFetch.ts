import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function createAuthedFetch(client: SupabaseClient = supabase) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);

    try {
      const {
        data: { session },
      } = await client.auth.getSession();
      if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }
    } catch (error) {
      console.warn("[Photobookers] getSession failed; continuing without auth", error);
    }

    return fetch(input, { ...init, headers });
  };
}
