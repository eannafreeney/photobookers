export const ADMIN_BOOK_SORT_COLUMNS = [
  "title",
  "artist",
  "publisher",
  "releaseDate",
  "views",
  "favorites",
  "outboundClicks",
] as const;

export type AdminBookSortColumn = (typeof ADMIN_BOOK_SORT_COLUMNS)[number];
export type AdminBookSortDir = "asc" | "desc";

export type AdminBookSort = {
  column: AdminBookSortColumn;
  dir: AdminBookSortDir;
};

const COLUMNS = new Set<string>(ADMIN_BOOK_SORT_COLUMNS);

/** First click: A–Z for names, highest/newest for the rest. */
const DEFAULT_DIR: Record<AdminBookSortColumn, AdminBookSortDir> = {
  title: "asc",
  artist: "asc",
  publisher: "asc",
  releaseDate: "desc",
  views: "desc",
  favorites: "desc",
  outboundClicks: "desc",
};

export function parseAdminBookSort(
  sort?: string,
  dir?: string,
): AdminBookSort | null {
  if (!sort || !COLUMNS.has(sort)) return null;
  const column = sort as AdminBookSortColumn;
  return {
    column,
    dir: dir === "asc" || dir === "desc" ? dir : DEFAULT_DIR[column],
  };
}

export function adminBookSortHref(
  column: AdminBookSortColumn,
  current: AdminBookSort | null,
  params: { search?: string; status?: string },
): string {
  const nextDir =
    current?.column === column
      ? current.dir === "asc"
        ? "desc"
        : "asc"
      : DEFAULT_DIR[column];

  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.search) search.set("search", params.search);
  search.set("sort", column);
  search.set("dir", nextDir);
  return `/dashboard/admin/books?${search.toString()}`;
}
