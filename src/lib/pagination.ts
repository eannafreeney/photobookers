import type { Context } from "hono";

export function getPagination(
  rawPage: number,
  totalCount: number,
  defaultLimit = 10,
) {
  const limit = defaultLimit;

  const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
  const page = Math.min(Math.max(rawPage, 1), totalPages);
  const offset = (page - 1) * limit;

  return { page, limit, offset, totalPages };
}
