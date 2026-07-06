function normalizeUrl(url) {
  let normalized = url.trim();
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }
  normalized = normalized.replace(/\/$/, "");
  return normalized;
}
function getHostname(url) {
  const normalized = normalizeUrl(url);
  try {
    const u = new URL(normalized);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host;
  } catch {
    return "";
  }
}
function isSameDomain(urlA, urlB) {
  return getHostname(urlA) === getHostname(urlB);
}
export {
  getHostname,
  isSameDomain,
  normalizeUrl
};
