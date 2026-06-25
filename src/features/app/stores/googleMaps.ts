export function buildGoogleMapsUrl(name: string, address: string): string {
  const query = `${name}, ${address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
