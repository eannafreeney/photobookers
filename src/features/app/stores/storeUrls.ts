export type StoreMapMarker = {
  slug: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

export function buildStoresViewUrl(
  basePath: string,
  params: {
    view?: "grid" | "map";
    query?: string;
    city?: string;
    country?: string;
    page?: number;
  },
) {
  const search = new URLSearchParams();
  if (params.view && params.view !== "grid") search.set("view", params.view);
  if (params.query) search.set("query", params.query);
  if (params.city) search.set("city", params.city);
  if (params.country) search.set("country", params.country);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
