function paginationRequestBaseUrl(requestUrl, pageParam = "page") {
  const base = "http://_";
  const u = requestUrl.startsWith("http") ? new URL(requestUrl) : new URL(requestUrl, base);
  u.searchParams.delete(pageParam);
  const qs = u.searchParams.toString();
  return qs ? `${u.pathname}?${qs}` : u.pathname;
}
function getPagination(rawPage, totalCount, defaultLimit = 12) {
  const limit = defaultLimit;
  const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
  const page = Math.min(Math.max(rawPage, 1), totalPages);
  const offset = (page - 1) * limit;
  return { page, limit, offset, totalPages };
}
export {
  getPagination,
  paginationRequestBaseUrl
};
