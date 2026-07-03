/** Production Supabase project ref — override via PRODUCTION_SUPABASE_PROJECT_REF. */
const productionSupabaseProjectRef =
  process.env.PRODUCTION_SUPABASE_PROJECT_REF ?? "dbmbrwmygpnhjyyccbjp";

function isStagingHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "staging.photobookers.com" || host.startsWith("staging.");
}

/** True on staging host, staging SITE_URL, or non-production Supabase config. */
export function isStaging(): boolean {
  if (process.env.IS_STAGING === "true") return true;
  if (process.env.APP_ENV === "staging") return true;

  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    try {
      if (isStagingHostname(new URL(siteUrl).hostname)) return true;
    } catch {
      // ignore invalid SITE_URL
    }
  }

  const config = `${process.env.SUPABASE_URL ?? ""} ${process.env.DATABASE_URL ?? ""}`;
  if (config.trim() && !config.includes(productionSupabaseProjectRef)) {
    return true;
  }

  return false;
}
