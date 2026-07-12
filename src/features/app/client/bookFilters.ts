import Alpine from "alpinejs";
import type { BookCatalogSort } from "../../../lib/bookCatalogSort";
import {
  buildBookCatalogFilterParams,
  MIN_SEARCH_LENGTH,
} from "./bookFilterParams";

export const BOOKS_CATALOG_TARGET_ID = "books-catalog";

export { buildBookCatalogFilterParams, MIN_SEARCH_LENGTH };

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
        const params = buildBookCatalogFilterParams(
          {
            query: ctx.query,
            tag: ctx.tag,
            sort: ctx.sort,
            defaultSort: ctx.defaultSort,
            minLen: ctx.minLen,
          },
          { includeFragment: true },
        );
        ctx.$ajax(ajaxPath + "?" + params.toString(), {
          target: BOOKS_CATALOG_TARGET_ID,
        });
        replaceHistory(
          buildBookCatalogFilterParams({
            query: ctx.query,
            tag: ctx.tag,
            sort: ctx.sort,
            defaultSort: ctx.defaultSort,
            minLen: ctx.minLen,
          }),
        );
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
