function buildGoogleMapsUrl(name, address) {
  const query = `${name}, ${address}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}
export {
  buildGoogleMapsUrl
};
