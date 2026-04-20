/**
 * Pathname plus query string for load-more / infinite-scroll requests.
 * Drops `page` so the client can append a fresh `page` param.
 */
export function paginationRequestBaseUrl(requestUrl: string): string {
  const base = "http://_";
  const u = requestUrl.startsWith("http")
    ? new URL(requestUrl)
    : new URL(requestUrl, base);
  u.searchParams.delete("page");
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
