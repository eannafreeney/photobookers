import Alpine from "alpinejs";
import type { BookCatalogSort } from "../../../lib/bookCatalogSort";

export const BOOKS_CATALOG_TARGET_ID = "books-catalog";

const MIN_SEARCH_LENGTH = 3;

type BookFiltersInitial = {
  query?: string;
  tag?: string | null;
  sort?: BookCatalogSort;
  defaultSort?: BookCatalogSort;
  ajaxPath?: string;
  /** When omitted, URL is not updated after filter changes. */
  historyPath?: string | null;
};

type BookFiltersCtx = {
  query: string;
  tag: string | null;
  sort: BookCatalogSort;
  defaultSort: BookCatalogSort;
  minLen: number;
  $ajax: (url: string, options?: { target?: string }) => void;
  refreshGrid(): void;
};

const buildFilterParams = (
  ctx: BookFiltersCtx,
  options?: { includeFragment?: boolean },
) => {
  const params = new URLSearchParams();
  if (ctx.tag) params.set("tag", ctx.tag);
  const trimmed = ctx.query.trim();
  if (trimmed.length >= ctx.minLen) params.set("q", trimmed);
  if (ctx.sort !== ctx.defaultSort) params.set("sort", ctx.sort);
  if (options?.includeFragment) params.set("fragment", "grid");
  return params;
};

export function registerBookFilters() {
  Alpine.data("bookFilters", (initial: BookFiltersInitial = {}) => {
    const ajaxPath = initial.ajaxPath ?? "/books";
    const historyPath = initial.historyPath ?? "/books";
    const defaultSort = initial.defaultSort ?? "newest";

    const replaceHistory = (params: URLSearchParams) => {
      if (historyPath === null) return;
      const qs = params.toString();
      history.replaceState({}, "", historyPath + (qs ? "?" + qs : ""));
    };

    return {
      query: initial.query ?? "",
      tag: initial.tag ?? null,
      sort: initial.sort ?? defaultSort,
      defaultSort,
      minLen: MIN_SEARCH_LENGTH,

      refreshGrid() {
        const ctx = this as unknown as BookFiltersCtx;
        const params = buildFilterParams(ctx, { includeFragment: true });
        ctx.$ajax(ajaxPath + "?" + params.toString(), {
          target: BOOKS_CATALOG_TARGET_ID,
        });
        replaceHistory(buildFilterParams(ctx));
      },

      applyFilter(nextTag: string | null) {
        const ctx = this as unknown as BookFiltersCtx;
        ctx.tag = nextTag;
        ctx.query = "";
        ctx.refreshGrid();
      },

      applySort() {
        const ctx = this as unknown as BookFiltersCtx;
        ctx.refreshGrid();
      },

      runSearch() {
        const ctx = this as unknown as BookFiltersCtx & {
          applyFilter(nextTag: string | null): void;
        };
        const trimmed = ctx.query.trim();
        if (trimmed.length >= ctx.minLen) {
          ctx.refreshGrid();
        } else if (trimmed.length === 0) {
          ctx.applyFilter(ctx.tag);
        }
      },

      clearFilters() {
        const ctx = this as unknown as BookFiltersCtx;
        ctx.tag = null;
        ctx.query = "";
        ctx.sort = ctx.defaultSort;
        ctx.refreshGrid();
      },
    };
  });
}
