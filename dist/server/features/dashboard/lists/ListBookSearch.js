import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../components/forms/FormPost.js";
import { closeIcon, plusIcon } from "../../../lib/icons.js";
const ListBookSearchResults = ({
  listId,
  query,
  results
}) => {
  const trimmed = query.trim();
  return /* @__PURE__ */ jsx("div", { id: "list-book-search-results", children: trimmed.length < 2 ? null : results.length === 0 ? /* @__PURE__ */ jsxs("p", { class: "p-3 text-sm text-on-surface-weak", children: [
    "No matching books found for \u201C",
    trimmed,
    "\u201D."
  ] }) : /* @__PURE__ */ jsx("ul", { class: "flex max-h-80 flex-col divide-y divide-outline overflow-y-auto", children: results.map((book) => /* @__PURE__ */ jsxs("li", { class: "flex items-center gap-3 bg-surface p-2", children: [
    book.coverUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: book.coverUrl,
        alt: "",
        loading: "lazy",
        class: "size-12 shrink-0 object-cover"
      }
    ) : /* @__PURE__ */ jsx("div", { class: "size-12 shrink-0 bg-surface-alt" }),
    /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("p", { class: "truncate text-sm font-medium text-on-surface-strong", children: book.title }),
      /* @__PURE__ */ jsx("p", { class: "truncate text-xs text-on-surface-weak", children: book.artist?.displayName ?? "Unknown artist" })
    ] }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/lists/${listId}/add-book`,
        className: "shrink-0",
        ...{
          "x-target": "toast list-books-editor list-book-search-results",
          "x-target.error": "toast"
        },
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: book.id }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "q", value: trimmed }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              class: "cursor-pointer text-on-surface-strong hover:opacity-75",
              title: "Add to list",
              "aria-label": `Add ${book.title}`,
              children: plusIcon(5)
            }
          )
        ]
      }
    )
  ] })) }) });
};
const ListBookSearch = ({ listId }) => {
  const alpineAttrs = {
    "x-data": "{ hasResults: false, searchValue: '' }",
    "@click.outside": "hasResults = false",
    "@keydown.escape.window": "hasResults = false; searchValue = ''; $refs.searchInput?.blur()"
  };
  return /* @__PURE__ */ jsxs("div", { class: "relative", ...alpineAttrs, children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "get",
        action: `/dashboard/lists/${listId}/add-book`,
        role: "search",
        autocomplete: "off",
        class: "relative",
        ...{
          "x-target": "list-book-search-results",
          "x-on:ajax:success": "hasResults = searchValue.trim().length >= 2"
        },
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "q",
              "x-ref": "searchInput",
              placeholder: "Search by title or artist\u2026",
              autocomplete: "off",
              class: "w-full rounded-radius border border-outline bg-surface py-2.5 pl-3 pr-10 text-sm text-on-surface-strong focus:outline-none",
              ...{
                "x-model": "searchValue",
                "@input.debounce.350ms": "$el.form.requestSubmit()",
                "@focus": "if (searchValue.trim().length >= 2) $el.form.requestSubmit()"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "x-cloak": true,
              "x-show": "hasResults || searchValue",
              class: "absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer opacity-70 hover:opacity-100",
              title: "Close search",
              "aria-label": "Close search",
              ...{
                "x-on:click": "hasResults = false; searchValue = ''; $refs.searchInput?.blur()"
              },
              children: closeIcon
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("p", { class: "mt-2 text-sm text-on-surface-weak", "x-show": "!hasResults", children: "Search by title or artist to add books. You can add more than one." }),
    /* @__PURE__ */ jsx(
      "div",
      {
        class: "absolute z-20 mt-1 w-full overflow-hidden rounded-radius border border-outline bg-surface-alt shadow-sm",
        "x-cloak": true,
        "x-show": "hasResults",
        children: /* @__PURE__ */ jsx("div", { id: "list-book-search-results" })
      }
    )
  ] });
};
var ListBookSearch_default = ListBookSearch;
export {
  ListBookSearchResults,
  ListBookSearch_default as default
};
