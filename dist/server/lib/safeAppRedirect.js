const DEFAULT_FALLBACK = "/";
function safeAppRedirect(value, fallback = DEFAULT_FALLBACK) {
  if (value == null || value === "" || value === "undefined") {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  const base = (process.env.SITE_URL ?? "http://localhost:5173").replace(
    /\/$/,
    ""
  );
  try {
    const parsed = new URL(trimmed, base);
    const baseUrl = new URL(base);
    if (parsed.origin === baseUrl.origin) {
      return parsed.pathname + parsed.search;
    }
  } catch {
  }
  return fallback;
}
export {
  safeAppRedirect
};
