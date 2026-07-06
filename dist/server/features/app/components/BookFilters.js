import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Pill from "../../../components/app/Pill.js";
import { DISCOVER_TAGS } from "../../../constants/discover.js";
import {
  BOOK_CATALOG_SORT_LABELS,
  BOOK_CATALOG_SORT_VALUES
} from "../../../lib/bookCatalogSort.js";
import { tagToSlug } from "../../../lib/tags.js";
import { capitalize } from "../../../utils.js";
import CollapsibleFilters from "./CollapsibleFilters.js";
const BOOKS_LIST_TARGET_ID = "books-list";
const BOOKS_CATALOG_TARGET_ID = "books-catalog";
const BookFilters = ({
  activeTag = null,
  query = null,
  sort = "newest",
  defaultSort = "newest",
  ajaxPath = "/books",
  historyPath = "/books",
  collapsible = false
}) => {
  const trimmedQuery = query?.trim() ?? "";
  const activeSlug = activeTag?.trim() || null;
  const activeFilterCount = (trimmedQuery.length >= 3 ? 1 : 0) + (sort !== defaultSort ? 1 : 0);
  const alpineAttrs = {
    "x-data": `bookFilters(${JSON.stringify({
      query: trimmedQuery,
      tag: activeSlug,
      sort,
      defaultSort,
      ajaxPath,
      historyPath
    })})`
  };
  const pillButtonClass = "cursor-pointer border-0 bg-transparent p-0 font-inherit";
  const controls = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(AllPill, { activeSlug, pillButtonClass }),
      DISCOVER_TAGS.map((tag) => /* @__PURE__ */ jsx(
        DiscoveryPill,
        {
          tag,
          activeSlug,
          pillButtonClass
        }
      ))
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row items-center gap-2 md:gap-4", children: [
      /* @__PURE__ */ jsx(FilterForm, {}),
      /* @__PURE__ */ jsx(TrendingSortSelect, {})
    ] })
  ] });
  return /* @__PURE__ */ jsx("div", { ...alpineAttrs, class: "mb-6", children: collapsible ? /* @__PURE__ */ jsx(
    CollapsibleFilters,
    {
      activeFilterCount,
      controlsId: "book-search-filters",
      desktopGridClass: "md:grid-cols-1",
      children: controls
    }
  ) : /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-4 rounded-lg border border-outline bg-surface p-4", children: controls }) });
};
var BookFilters_default = BookFilters;
const AllPill = ({ activeSlug, pillButtonClass }) => /* @__PURE__ */ jsx("button", { type: "button", class: pillButtonClass, "x-on:click": "applyFilter(null)", children: /* @__PURE__ */ jsx(Pill, { variant: activeSlug ? "default" : "inverse", children: "All" }) });
const DiscoveryPill = ({
  tag,
  activeSlug,
  pillButtonClass
}) => {
  const slug = tagToSlug(tag);
  const isActive = activeSlug === slug;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      class: pillButtonClass,
      "x-on:click": `applyFilter('${slug}')`,
      children: /* @__PURE__ */ jsx(Pill, { variant: isActive ? "inverse" : "default", children: capitalize(tag) })
    },
    tag
  );
};
const FilterForm = () => {
  const searchInputAttrs = {
    "x-on:input.debounce.400ms": "runSearch()"
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 w-full", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "search",
        name: "query",
        "x-model": "query",
        ...searchInputAttrs,
        placeholder: "Search by title, artist, publisher, or tag\u2026",
        class: "min-w-0 flex-1 rounded-full border border-outline bg-surface-alt px-4 py-2 text-base md:text-sm text-on-surface-strong placeholder:text-on-surface-weak focus:outline-none focus:ring-1 focus:ring-primary"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "x-on:click": "clearFilters()",
        class: "cursor-pointer rounded-full border border-outline px-4 py-2 text-sm font-medium text-on-surface hover:text-on-surface-strong",
        children: "Clear"
      }
    )
  ] });
};
const TrendingSortSelect = () => /* @__PURE__ */ jsxs("label", { class: "flex w-full md:w-auto min-w-0 items-center gap-2 text-sm text-on-surface", children: [
  /* @__PURE__ */ jsx("span", { class: "sr-only", children: "Sort by" }),
  /* @__PURE__ */ jsx(
    "select",
    {
      "x-model": "sort",
      "x-on:change": "applySort()",
      class: "w-full md:w-auto min-w-0 cursor-pointer rounded-full border border-outline bg-surface-alt px-4 py-2 text-sm text-on-surface-strong focus:outline-none focus:ring-1 focus:ring-primary",
      children: BOOK_CATALOG_SORT_VALUES.map((value) => /* @__PURE__ */ jsx("option", { value, children: BOOK_CATALOG_SORT_LABELS[value] }, value))
    }
  )
] });
export {
  BOOKS_CATALOG_TARGET_ID,
  BOOKS_LIST_TARGET_ID,
  BookFilters_default as default
};
