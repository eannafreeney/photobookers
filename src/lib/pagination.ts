/**
 * Pathname plus query string for load-more / infinite-scroll requests.
 * Drops the page query param so the client can append a fresh value.
 */
export function paginationRequestBaseUrl(
  requestUrl: string,
  pageParam = "page",
): string {
  const base = "http://_";
  const u = requestUrl.startsWith("http")
    ? new URL(requestUrl)
    : new URL(requestUrl, base);
  u.searchParams.delete(pageParam);
  const qs = u.searchParams.toString();
  return qs ? `${u.pathname}?${qs}` : u.pathname;
}

export function getPagination(
  rawPage: number,
  totalCount: number,
  defaultLimit = 12,
) {
  const limit = defaultLimit;

  const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
  const page = Math.min(Math.max(rawPage, 1), totalPages);
  const offset = (page - 1) * limit;

  return { page, limit, offset, totalPages };
}
