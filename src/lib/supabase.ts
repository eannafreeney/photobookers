import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import { getCookie } from "hono/cookie";

// Server-side client (use service role for admin operations)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Storage-only client: never used for auth, so it always sends service_role (fixes RLS)
export const supabaseStorageAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// For verifying user tokens
export const supabaseStorage = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// SSR client for auth flows - creates a new client per request
export function createSupabaseClient(c: Context) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce", // 🔥 REQUIRED
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false, // 🔥 REQUIRED for SSR
      },
      cookies: {
        get(name) {
          return getCookie(c, name);
        },
        set(name, value, options) {
          c.header("Set-Cookie", serializeCookieHeader(name, value, options), {
            append: true,
          });
        },
        remove(name, options) {
          c.header(
            "Set-Cookie",
            serializeCookieHeader(name, "", { ...options, maxAge: 0 }),
            { append: true },
          );
        },
      },
    },
  );
}
