const productionSupabaseProjectRef = process.env.PRODUCTION_SUPABASE_PROJECT_REF ?? "dbmbrwmygpnhjyyccbjp";
function isStagingHostname(hostname) {
  const host = hostname.toLowerCase();
  return host === "staging.photobookers.com" || host.startsWith("staging.");
}
function isStaging() {
  if (process.env.IS_STAGING === "true") return true;
  if (process.env.APP_ENV === "staging") return true;
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    try {
      if (isStagingHostname(new URL(siteUrl).hostname)) return true;
    } catch {
    }
  }
  const config = `${process.env.SUPABASE_URL ?? ""} ${process.env.DATABASE_URL ?? ""}`;
  if (config.trim() && !config.includes(productionSupabaseProjectRef)) {
    return true;
  }
  return false;
}
export {
  isStaging
};
