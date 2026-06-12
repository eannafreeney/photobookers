import Alpine from "alpinejs";

export const BOOKS_CATALOG_TARGET_ID = "books-catalog";

const MIN_SEARCH_LENGTH = 3;

type BookFiltersInitial = {
  q?: string;
  tag?: string | null;
};

type BookFiltersCtx = {
  q: string;
  tag: string | null;
  minLen: number;
  $ajax: (url: string, options?: { target?: string }) => void;
};

export function registerBookFilters() {
  Alpine.data("bookFilters", (initial: BookFiltersInitial = {}) => {
    return {
      q: initial.q ?? "",
      tag: initial.tag ?? null,
      minLen: MIN_SEARCH_LENGTH,

      applyFilter(nextTag: string | null) {
        const ctx = this as unknown as BookFiltersCtx;
        ctx.tag = nextTag;
        ctx.q = "";
        const params = new URLSearchParams();
        if (nextTag) params.set("tag", nextTag);
        params.set("fragment", "grid");
        ctx.$ajax("/books?" + params.toString(), {
          target: BOOKS_CATALOG_TARGET_ID,
        });
        const display = new URLSearchParams();
        if (nextTag) display.set("tag", nextTag);
        const qs = display.toString();
        history.replaceState({}, "", "/books" + (qs ? "?" + qs : ""));
      },

      runSearch() {
        const ctx = this as unknown as BookFiltersCtx & {
          applyFilter(nextTag: string | null): void;
        };
        const trimmed = ctx.q.trim();
        if (trimmed.length >= ctx.minLen) {
          const params = new URLSearchParams();
          if (ctx.tag) params.set("tag", ctx.tag);
          params.set("q", trimmed);
          params.set("fragment", "grid");
          ctx.$ajax("/books?" + params.toString(), {
            target: BOOKS_CATALOG_TARGET_ID,
          });
          const display = new URLSearchParams();
          if (ctx.tag) display.set("tag", ctx.tag);
          display.set("q", trimmed);
          history.replaceState({}, "", "/books?" + display.toString());
        } else if (trimmed.length === 0) {
          ctx.applyFilter(null);
        }
      },

      clearFilters() {
        const ctx = this as unknown as { applyFilter(nextTag: string | null): void };
        ctx.applyFilter(null);
      },
    };
  });
}
