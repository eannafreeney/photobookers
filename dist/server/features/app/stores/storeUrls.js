function buildStoresViewUrl(basePath, params) {
  const search = new URLSearchParams();
  if (params.view && params.view !== "grid") search.set("view", params.view);
  if (params.query) search.set("query", params.query);
  if (params.city) search.set("city", params.city);
  if (params.country) search.set("country", params.country);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
export {
  buildStoresViewUrl
};
