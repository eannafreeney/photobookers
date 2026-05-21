/**
 * Expo inlines EXPO_PUBLIC_* at build time. Set these in:
 * - local dev: mobile-expo/.env (copy from .env.example)
 * - EAS production: eas.json env block or `eas secret:create`
 */
function requireEnv(name: string, value: string | undefined): string {
  if (value) return value;
  throw new Error(
    `Missing ${name}. Copy mobile-expo/.env.example to .env and set values.`,
  );
}

const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

export const env = {
  /** Hyperview API origin, no trailing slash. */
  serverUrl: isDev
    ? (process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3000")
    : requireEnv(
        "EXPO_PUBLIC_SERVER_URL",
        process.env.EXPO_PUBLIC_SERVER_URL,
      ),
  supabaseUrl: requireEnv(
    "EXPO_PUBLIC_SUPABASE_URL",
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: requireEnv(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
};

export const entrypointUrl = `${env.serverUrl}/hyperview`;
