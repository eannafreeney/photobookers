import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { isFavoritesListId } from "../../../domain/lists/utils.js";
const ShelfListsSection = ({ shelfSlug, lists }) => {
  return /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsx("h2", { class: "font-display text-2xl font-medium text-on-surface-strong", children: "Lists" }),
    /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: lists.map((list) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: `/shelf/${shelfSlug}/lists/${list.slug}`,
        class: "flex gap-3 border border-outline bg-surface-alt p-3 transition hover:border-outline-strong",
        children: [
          /* @__PURE__ */ jsx("div", { class: "flex size-16 shrink-0 overflow-hidden bg-surface", children: list.coverUrls?.[0] ? /* @__PURE__ */ jsx(
            "img",
            {
              src: list.coverUrls[0],
              alt: "",
              class: "size-full object-cover",
              loading: "lazy"
            }
          ) : /* @__PURE__ */ jsx("div", { class: "flex size-full items-center justify-center text-xs text-on-surface-weak", children: isFavoritesListId(list.id) ? "\u2665" : "List" }) }),
          /* @__PURE__ */ jsxs("div", { class: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { class: "truncate font-medium text-on-surface-strong", children: list.title }),
            /* @__PURE__ */ jsxs("p", { class: "text-xs text-on-surface-weak tabular-nums", children: [
              list.bookCount,
              " ",
              list.bookCount === 1 ? "book" : "books"
            ] })
          ] })
        ]
      }
    )) })
  ] });
};
var ShelfListsSection_default = ShelfListsSection;
export {
  ShelfListsSection_default as default
};
