const MIN_SEARCH_LENGTH = 3;
function buildBookCatalogFilterParams(input, options) {
  const minLen = input.minLen ?? MIN_SEARCH_LENGTH;
  const params = new URLSearchParams();
  if (input.tag) params.set("tag", input.tag);
  const trimmed = input.query.trim();
  if (trimmed.length >= minLen) params.set("q", trimmed);
  if (input.sort !== input.defaultSort) params.set("sort", input.sort);
  if (options?.includeFragment) params.set("fragment", "grid");
  return params;
}
export {
  MIN_SEARCH_LENGTH,
  buildBookCatalogFilterParams
};
