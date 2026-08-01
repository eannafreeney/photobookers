import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import Button from "../../../../../components/app/Button.js";
const AddBookResults = ({ action, query, results }) => {
  const trimmed = query.trim();
  return /* @__PURE__ */ jsx("div", { id: "add-book-results", class: "mt-3", children: trimmed === "" ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: "Search for a book by title or artist to add it to this issue." }) : results.length === 0 ? /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface-weak", children: [
    "No matching books found for \u201C",
    trimmed,
    "\u201D."
  ] }) : /* @__PURE__ */ jsx("ul", { class: "flex max-h-[min(50vh,calc(100dvh-18rem))] flex-col divide-y divide-outline/60 overflow-y-auto overscroll-contain rounded border border-outline/60", children: results.map((book) => /* @__PURE__ */ jsxs("li", { class: "flex items-center gap-3 bg-surface p-2", children: [
    book.coverUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: book.coverUrl,
        alt: "",
        loading: "lazy",
        class: "h-16 w-12 shrink-0 border border-outline object-cover"
      }
    ) : /* @__PURE__ */ jsx("div", { class: "flex h-16 w-12 shrink-0 items-center justify-center border border-outline text-[0.55rem] text-on-surface-weak", children: "no image" }),
    /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("p", { class: "truncate text-sm font-medium text-on-surface-strong", children: book.title }),
      /* @__PURE__ */ jsx("p", { class: "truncate text-xs text-on-surface-weak", children: book.artist?.displayName ?? "Unknown artist" })
    ] }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `${action}/add-book`,
        className: "shrink-0",
        ...{
          "x-target": "magazine-books toast",
          "x-on:ajax:after": "$dispatch('dialog:close')"
        },
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: book.id }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", children: "Add" })
        ]
      }
    )
  ] }, book.id)) }) });
};
const AddBookModal = ({ action, query, results }) => {
  return /* @__PURE__ */ jsxs(Modal, { title: "Add a book", maxWidth: "max-w-2xl", children: [
    /* @__PURE__ */ jsx(
      "form",
      {
        "x-target": "add-book-results",
        method: "get",
        action: `${action}/add-book`,
        role: "search",
        children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "search",
            name: "q",
            value: query,
            placeholder: "Search by book title or artist\u2026",
            autofocus: true,
            autocomplete: "off",
            ...{ "x-on:input.debounce.350ms": "$el.form.requestSubmit()" },
            class: "w-full border border-outline bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(AddBookResults, { action, query, results })
  ] });
};
var AddBookModal_default = AddBookModal;
export {
  AddBookResults,
  AddBookModal_default as default
};
