import Alpine from "alpinejs";
import {
  buildBookCatalogFilterParams,
  MIN_SEARCH_LENGTH
} from "./bookFilterParams.js";
const BOOKS_CATALOG_TARGET_ID = "books-catalog";
function registerBookFilters() {
  Alpine.data("bookFilters", (initial = {}) => {
    const ajaxPath = initial.ajaxPath ?? "/books";
    const historyPath = initial.historyPath ?? "/books";
    const defaultSort = initial.defaultSort ?? "newest";
    const replaceHistory = (params) => {
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
        const ctx = this;
        const params = buildBookCatalogFilterParams(
          {
            query: ctx.query,
            tag: ctx.tag,
            sort: ctx.sort,
            defaultSort: ctx.defaultSort,
            minLen: ctx.minLen
          },
          { includeFragment: true }
        );
        ctx.$ajax(ajaxPath + "?" + params.toString(), {
          target: BOOKS_CATALOG_TARGET_ID
        });
        replaceHistory(
          buildBookCatalogFilterParams({
            query: ctx.query,
            tag: ctx.tag,
            sort: ctx.sort,
            defaultSort: ctx.defaultSort,
            minLen: ctx.minLen
          })
        );
      },
      applyFilter(nextTag) {
        const ctx = this;
        ctx.tag = nextTag;
        ctx.query = "";
        ctx.refreshGrid();
      },
      applySort() {
        const ctx = this;
        ctx.refreshGrid();
      },
      runSearch() {
        const ctx = this;
        const trimmed = ctx.query.trim();
        if (trimmed.length >= ctx.minLen) {
          ctx.refreshGrid();
        } else if (trimmed.length === 0) {
          ctx.applyFilter(ctx.tag);
        }
      },
      clearFilters() {
        const ctx = this;
        ctx.tag = null;
        ctx.query = "";
        ctx.sort = ctx.defaultSort;
        ctx.refreshGrid();
      }
    };
  });
}
export {
  BOOKS_CATALOG_TARGET_ID,
  MIN_SEARCH_LENGTH,
  buildBookCatalogFilterParams,
  registerBookFilters
};
