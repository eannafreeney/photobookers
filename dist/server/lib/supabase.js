import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getCookie } from "hono/cookie";
import { getSharedCookieOptions } from "./authCookies.js";
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
const supabaseStorageAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const supabaseStorage = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
function createSupabaseClient(c) {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: "pkce",
        // 🔥 REQUIRED
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false
        // 🔥 REQUIRED for SSR
      },
      cookies: {
        get(name) {
          return getCookie(c, name);
        },
        set(name, value, options) {
          c.header(
            "Set-Cookie",
            serializeCookieHeader(name, value, {
              ...options,
              ...getSharedCookieOptions(c)
            }),
            {
              append: true
            }
          );
        },
        remove(name, options) {
          c.header(
            "Set-Cookie",
            serializeCookieHeader(name, "", {
              ...options,
              ...getSharedCookieOptions(c),
              maxAge: 0
            }),
            { append: true }
          );
        }
      }
    }
  );
}
export {
  createSupabaseClient,
  supabaseAdmin,
  supabaseAnon,
  supabaseStorage,
  supabaseStorageAdmin
};
