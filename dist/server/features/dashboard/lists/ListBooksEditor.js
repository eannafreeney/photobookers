import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
const ListBooksEditor = ({ listId, books }) => {
  if (books.length === 0) {
    return /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: "No books in this list yet. Use the + button on any book card to add one." });
  }
  return /* @__PURE__ */ jsx("ul", { id: "list-books-editor", class: "flex flex-col gap-2", children: books.map((book) => /* @__PURE__ */ jsxs("li", { class: "flex items-center gap-3 border border-outline bg-surface-alt p-2", children: [
    book.coverUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: book.coverUrl,
        alt: "",
        class: "size-12 object-cover shrink-0",
        loading: "lazy"
      }
    ) : /* @__PURE__ */ jsx("div", { class: "size-12 bg-surface shrink-0" }),
    /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx(Link, { href: `/books/${book.slug}`, children: /* @__PURE__ */ jsx("span", { class: "text-sm font-medium text-on-surface-strong", children: book.title }) }),
      book.artist?.displayName ? /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-weak", children: book.artist.displayName }) : null
    ] }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action: `/dashboard/lists/${listId}/books/${book.id}`,
        "x-data": "{ isSubmitting: false }",
        ...{
          "@ajax:before": "isSubmitting = true",
          "@ajax:after": "isSubmitting = false",
          "@ajax:error": "isSubmitting = false",
          "x-target": "toast list-books-editor",
          "x-target.error": "toast"
        },
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "_method", value: "DELETE" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              class: "text-sm text-error hover:underline disabled:opacity-50",
              "x-bind:disabled": "isSubmitting",
              children: "Remove"
            }
          )
        ]
      }
    )
  ] })) });
};
var ListBooksEditor_default = ListBooksEditor;
export {
  ListBooksEditor_default as default
};
