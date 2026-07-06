import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View
} from "../../../lib/hxml-comps.js";
import { DISCOVER_TAGS } from "../../../constants/discover.js";
import {
  BOOK_CATALOG_SORT_LABELS,
  BOOK_CATALOG_SORT_VALUES
} from "../../../lib/bookCatalogSort.js";
import { booksFilterUrl, slugToTag, tagToSlug } from "../../../lib/tags.js";
import { capitalize } from "../../../utils.js";
const BOOKS_CATALOG_TARGET_ID = "books-catalog";
const BOOKS_LIST_TARGET_ID = "books-list-host";
const BOOKS_FILTERS_DRAWER_ID = "book-filters-drawer";
const BOOKS_FILTER_Q_ID = "books-filter-q";
const MIN_SEARCH_LENGTH = 3;
const filterStateKey = (activeSlug, trimmedQ) => `${activeSlug ?? "all"}:${trimmedQ.length >= MIN_SEARCH_LENGTH ? trimmedQ : ""}`;
const filterElementIds = (activeSlug, trimmedQ) => {
  const stateKey = filterStateKey(activeSlug, trimmedQ);
  return {
    drawerId: `book-filters-drawer-${stateKey}`,
    chevronClosedId: `book-filters-chevron-closed-${stateKey}`,
    chevronOpenId: `book-filters-chevron-open-${stateKey}`,
    filterQId: `books-filter-q-${stateKey}`
  };
};
const filterSummary = (activeSlug, trimmedQ, sort, defaultSort) => {
  const parts = [];
  if (activeSlug) parts.push(capitalize(slugToTag(activeSlug)));
  if (trimmedQ.length >= MIN_SEARCH_LENGTH) parts.push(`"${trimmedQ}"`);
  if (sort !== defaultSort) parts.push(BOOK_CATALOG_SORT_LABELS[sort]);
  return parts.length > 0 ? ` \xB7 ${parts.join(" \xB7 ")}` : "";
};
const defaultFilterPath = (baseUrl) => `${baseUrl}/hyperview/books`;
const catalogHref = (filterPath, {
  tag,
  q,
  sort,
  defaultSort
}) => {
  const path = booksFilterUrl(filterPath, {
    tag,
    query: q,
    sort,
    defaultSort
  });
  return `${path}${path.includes("?") ? "&" : "?"}fragment=catalog`;
};
const BookFiltersPanel = ({
  baseUrl,
  activeTag = null,
  q = null,
  sort = "newest",
  defaultSort = "newest",
  filterPath: filterPathProp,
  scrollToTopTarget
}) => {
  const filterPath = filterPathProp ?? defaultFilterPath(baseUrl);
  const trimmedQ = q?.trim() ?? "";
  const activeSlug = activeTag?.trim() || null;
  const summary = filterSummary(activeSlug, trimmedQ, sort, defaultSort);
  const hasActiveFilters = Boolean(activeSlug) || trimmedQ.length >= MIN_SEARCH_LENGTH || sort !== defaultSort;
  const filterParams = { sort, defaultSort };
  const searchPostHref = booksFilterUrl(filterPath, {
    tag: activeSlug,
    query: trimmedQ,
    ...filterParams
  });
  const hrefFor = (params) => catalogHref(filterPath, { ...filterParams, ...params });
  const { drawerId, chevronClosedId, chevronOpenId, filterQId } = filterElementIds(activeSlug, trimmedQ);
  return /* @__PURE__ */ jsxs(View, { style: "book-filters", children: [
    /* @__PURE__ */ jsxs(View, { style: "book-filters-toggle", children: [
      /* @__PURE__ */ jsxs(View, { style: "book-filters-toggle-main", children: [
        /* @__PURE__ */ jsxs(Text, { style: "book-filters-toggle-label", "number-of-lines": 1, children: [
          "Filters",
          summary
        ] }),
        /* @__PURE__ */ jsx(View, { id: chevronClosedId, children: /* @__PURE__ */ jsx(Text, { style: "book-filters-toggle-chevron", children: "\u25B6" }) }),
        /* @__PURE__ */ jsx(View, { id: chevronOpenId, hide: "true", children: /* @__PURE__ */ jsx(Text, { style: "book-filters-toggle-chevron", children: "\u25BC" }) }),
        /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: drawerId }),
        /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: chevronClosedId }),
        /* @__PURE__ */ jsx(Behavior, { action: "toggle", target: chevronOpenId })
      ] }),
      hasActiveFilters ? /* @__PURE__ */ jsxs(View, { style: "book-filters-toggle-clear", children: [
        /* @__PURE__ */ jsx(Text, { style: "book-filters-clear-label", children: "Clear" }),
        scrollToTopTarget ? /* @__PURE__ */ jsx(Behavior, { action: "scroll-to-top", target: scrollToTopTarget }) : null,
        /* @__PURE__ */ jsx(
          Behavior,
          {
            verb: "get",
            action: "replace",
            target: BOOKS_CATALOG_TARGET_ID,
            href: hrefFor({ tag: null, q: null, sort: defaultSort })
          }
        )
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx(View, { id: drawerId, hide: "true", children: /* @__PURE__ */ jsxs(View, { style: "book-filters-panel", children: [
      /* @__PURE__ */ jsxs(View, { style: "book-filters-tags", children: [
        /* @__PURE__ */ jsxs(
          View,
          {
            style: activeSlug ? "book-filter-pill" : "book-filter-pill-active",
            children: [
              scrollToTopTarget ? /* @__PURE__ */ jsx(Behavior, { action: "scroll-to-top", target: scrollToTopTarget }) : null,
              /* @__PURE__ */ jsx(
                Behavior,
                {
                  verb: "get",
                  action: "replace",
                  target: BOOKS_CATALOG_TARGET_ID,
                  href: hrefFor({ tag: null, q: null })
                }
              ),
              /* @__PURE__ */ jsx(
                Text,
                {
                  style: activeSlug ? "book-filter-pill-label" : "book-filter-pill-label-active",
                  children: "All"
                }
              )
            ]
          }
        ),
        DISCOVER_TAGS.map((tag) => {
          const slug = tagToSlug(tag);
          const isActive = activeSlug === slug;
          return /* @__PURE__ */ jsxs(
            View,
            {
              style: isActive ? "book-filter-pill-active" : "book-filter-pill",
              children: [
                scrollToTopTarget ? /* @__PURE__ */ jsx(Behavior, { action: "scroll-to-top", target: scrollToTopTarget }) : null,
                /* @__PURE__ */ jsx(
                  Behavior,
                  {
                    verb: "get",
                    action: "replace",
                    target: BOOKS_CATALOG_TARGET_ID,
                    href: hrefFor({ tag: slug })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: isActive ? "book-filter-pill-label-active" : "book-filter-pill-label",
                    children: capitalize(tag)
                  }
                )
              ]
            },
            tag
          );
        })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: "book-filters-section", children: [
        /* @__PURE__ */ jsx(Text, { style: "book-filters-section-label", children: "Search" }),
        /* @__PURE__ */ jsx(Form, { id: "books-filter-form", children: /* @__PURE__ */ jsxs(View, { style: "book-filters-search", children: [
          /* @__PURE__ */ jsx(
            TextField,
            {
              id: filterQId,
              style: "book-filters-search-input",
              name: "q",
              value: trimmedQ,
              placeholder: "Search by title, artist, publisher, or tag\u2026"
            }
          ),
          /* @__PURE__ */ jsxs(View, { style: "book-filters-search-actions", children: [
            /* @__PURE__ */ jsxs(View, { style: "book-filters-search-btn", children: [
              /* @__PURE__ */ jsx(Text, { style: "book-filters-search-label", children: "Search" }),
              scrollToTopTarget ? /* @__PURE__ */ jsx(Behavior, { action: "scroll-to-top", target: scrollToTopTarget }) : null,
              /* @__PURE__ */ jsx(
                Behavior,
                {
                  verb: "post",
                  action: "replace",
                  target: BOOKS_CATALOG_TARGET_ID,
                  href: searchPostHref
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(View, { style: "book-filters-clear", children: [
              /* @__PURE__ */ jsx(Text, { style: "book-filters-clear-label", children: "Clear" }),
              scrollToTopTarget ? /* @__PURE__ */ jsx(Behavior, { action: "scroll-to-top", target: scrollToTopTarget }) : null,
              /* @__PURE__ */ jsx(
                Behavior,
                {
                  verb: "get",
                  action: "replace",
                  target: BOOKS_CATALOG_TARGET_ID,
                  href: hrefFor({ tag: null, q: null, sort: defaultSort })
                }
              )
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: "book-filters-section", children: [
        /* @__PURE__ */ jsx(Text, { style: "book-filters-section-label", children: "Sort by" }),
        /* @__PURE__ */ jsx(View, { style: "book-filters-sort-row", children: BOOK_CATALOG_SORT_VALUES.map((value) => {
          const isActive = sort === value;
          return /* @__PURE__ */ jsxs(
            View,
            {
              style: isActive ? "book-filter-pill-active" : "book-filter-pill",
              children: [
                scrollToTopTarget ? /* @__PURE__ */ jsx(Behavior, { action: "scroll-to-top", target: scrollToTopTarget }) : null,
                /* @__PURE__ */ jsx(
                  Behavior,
                  {
                    verb: "get",
                    action: "replace",
                    target: BOOKS_CATALOG_TARGET_ID,
                    href: hrefFor({
                      tag: activeSlug,
                      q: trimmedQ,
                      sort: value
                    })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Text,
                  {
                    style: isActive ? "book-filter-pill-label-active" : "book-filter-pill-label",
                    children: BOOK_CATALOG_SORT_LABELS[value]
                  }
                )
              ]
            },
            value
          );
        }) })
      ] })
    ] }) })
  ] });
};
var BookFiltersPanel_default = BookFiltersPanel;
const bookFiltersStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "books-catalog-shell", flex: 1, flexDirection: "column" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters",
      flexShrink: 0,
      width: "100%",
      marginBottom: 16,
      backgroundColor: "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E5E4"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-toggle",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-toggle-main",
      flex: 1,
      flexDirection: "row",
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-toggle-clear",
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: 12,
      paddingRight: 12,
      marginLeft: 8,
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-toggle-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#1C1C1E",
      marginRight: 6
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-filters-toggle-chevron", fontSize: 14, color: "#9CA3AF" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-panel",
      paddingTop: 0,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      borderTopWidth: 1,
      borderTopColor: "#E5E5E4"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-tags",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      marginBottom: 12,
      marginTop: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filter-pill",
      borderWidth: 1,
      borderColor: "#E5E5E4",
      borderRadius: 999,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 14,
      paddingRight: 14,
      backgroundColor: "#FFFFFF",
      marginRight: 8,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filter-pill-active",
      borderWidth: 1,
      borderColor: "#1C1C1E",
      borderRadius: 999,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 14,
      paddingRight: 14,
      backgroundColor: "#1C1C1E",
      marginRight: 8,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filter-pill-label",
      fontSize: 14,
      fontWeight: "500",
      color: "#1C1C1E"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filter-pill-label-active",
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-filters-section", flexDirection: "column", marginTop: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-section-label",
      fontSize: 12,
      fontWeight: "600",
      color: "#6B6B6B",
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-search",
      flexDirection: "column",
      width: "100%",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-search-actions",
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-search-input",
      width: "100%",
      borderWidth: 1,
      borderColor: "#E5E5E4",
      borderRadius: 999,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: 15,
      backgroundColor: "#F4F4F3",
      color: "#1C1C1E"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-search-btn",
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 14,
      paddingRight: 14,
      flexShrink: 0,
      backgroundColor: "#1C1C1E",
      borderRadius: 999
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-search-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-clear",
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 12,
      paddingRight: 12,
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-clear-label",
      fontSize: 14,
      fontWeight: "500",
      color: "#6B6B6B"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-filters-sort-row",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "books-list-panel", flex: 1 })
] });
export {
  BOOKS_CATALOG_TARGET_ID,
  BOOKS_FILTERS_DRAWER_ID,
  BOOKS_FILTER_Q_ID,
  BOOKS_LIST_TARGET_ID,
  bookFiltersStyles,
  BookFiltersPanel_default as default
};
