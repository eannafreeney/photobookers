import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import { deleteIcon, dragHandleIcon } from "../../../lib/icons.js";
const reorderHandleAttrs = {
  draggable: true,
  "@dragstart": "onReorderDragStart($event, $el.closest('[data-book-id]'))",
  "@dragend": "onReorderDragEnd()"
};
const reorderRowAttrs = {
  "@dragenter.prevent": "onReorderDragEnter($el)",
  "@dragover.prevent": true,
  "@drop.prevent": true
};
const ListBooks = ({ listId, books }) => {
  if (books.length === 0) {
    return /* @__PURE__ */ jsx("div", { id: "list-books-editor", children: /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: "No books in this list yet. Search above to add some." }) });
  }
  const reorderUrl = `/dashboard/lists/${listId}/reorder`;
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "list-books-editor",
      ...{
        "x-data": `booksTableReorder(${JSON.stringify(books.map((book) => book.id))}, null, ${JSON.stringify(reorderUrl)})`
      },
      children: /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-2", children: books.map((book) => /* @__PURE__ */ jsxs(
        "li",
        {
          class: "flex items-center gap-3 border border-outline bg-surface-alt p-2",
          ...{ "data-book-id": book.id },
          ...reorderRowAttrs,
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                class: "flex shrink-0 items-center justify-center text-on-surface/50 cursor-grab active:cursor-grabbing",
                "aria-label": "Drag to reorder",
                ...reorderHandleAttrs,
                children: dragHandleIcon()
              }
            ),
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
              book.artist?.displayName ? /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-weak", children: book.artist.displayName }) : null,
              book.publisher?.displayName ? /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-weak", children: book.publisher.displayName }) : null
            ] }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `/dashboard/lists/${listId}/books/${book.id}/note`,
                "x-target": "modal-root",
                class: "shrink-0 rounded border border-outline bg-surface-alt px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface cursor-pointer",
                title: book.note ? "Edit note" : "Add note",
                "aria-label": book.note ? `Edit note for ${book.title}` : `Add note for ${book.title}`,
                children: book.note ? "Edit Note" : "Add Note"
              }
            ),
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
                      class: "cursor-pointer text-on-surface hover:text-error disabled:opacity-50",
                      title: "Remove from list",
                      "aria-label": `Remove ${book.title}`,
                      "x-bind:disabled": "isSubmitting",
                      children: deleteIcon
                    }
                  )
                ]
              }
            )
          ]
        }
      )) })
    }
  );
};
var ListBooks_default = ListBooks;
export {
  ListBooks_default as default
};
