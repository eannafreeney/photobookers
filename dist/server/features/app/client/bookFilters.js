import Alpine from "alpinejs";
const BOOKS_CATALOG_TARGET_ID = "books-catalog";
const MIN_SEARCH_LENGTH = 3;
const buildFilterParams = (ctx, options) => {
  const params = new URLSearchParams();
  if (ctx.tag) params.set("tag", ctx.tag);
  const trimmed = ctx.query.trim();
  if (trimmed.length >= ctx.minLen) params.set("q", trimmed);
  if (ctx.sort !== ctx.defaultSort) params.set("sort", ctx.sort);
  if (options?.includeFragment) params.set("fragment", "grid");
  return params;
};
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
        const params = buildFilterParams(ctx, { includeFragment: true });
        ctx.$ajax(ajaxPath + "?" + params.toString(), {
          target: BOOKS_CATALOG_TARGET_ID
        });
        replaceHistory(buildFilterParams(ctx));
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
  registerBookFilters
};
