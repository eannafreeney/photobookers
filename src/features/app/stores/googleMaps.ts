export function buildGoogleMapsUrl(name: string, address: string): string {
  const query = `${name}, ${address}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}
