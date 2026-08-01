import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import Button from "../../../components/app/Button.js";
const ListsTable = ({ lists, shelfSlug, shelfPublic }) => {
  if (lists.length === 0) {
    return /* @__PURE__ */ jsxs("div", { class: "rounded border border-outline bg-surface-alt p-6 text-sm text-on-surface", children: [
      /* @__PURE__ */ jsx("p", { class: "mb-3", children: "You don\u2019t have any lists yet." }),
      /* @__PURE__ */ jsx("p", { class: "text-on-surface-weak", children: "Create a list like \u201CFavourite books of the year\u201D, then add books from any book card with the + button." })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { class: "overflow-x-auto border border-outline", children: /* @__PURE__ */ jsxs("table", { class: "w-full text-left text-sm", children: [
    /* @__PURE__ */ jsx("thead", { class: "border-b border-outline bg-surface-alt kicker text-on-surface-weak", children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Title" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Books" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Visibility" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Public URL" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: lists.map((list) => {
      const publicUrl = shelfPublic && shelfSlug && list.isPublic ? `/shelf/${shelfSlug}/lists/${list.slug}` : null;
      return /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline last:border-0", children: [
        /* @__PURE__ */ jsxs("td", { class: "px-4 py-3", children: [
          /* @__PURE__ */ jsx("div", { class: "font-medium text-on-surface-strong", children: list.title }),
          list.description ? /* @__PURE__ */ jsx("p", { class: "mt-0.5 text-xs text-on-surface-weak line-clamp-1", children: list.description }) : null
        ] }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3 tabular-nums", children: list.bookCount }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: list.isPublic ? /* @__PURE__ */ jsx("span", { class: "text-accent", children: "Public" }) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "Private" }) }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: publicUrl ? /* @__PURE__ */ jsx(
          "a",
          {
            href: publicUrl,
            class: "text-accent underline underline-offset-2",
            target: "_blank",
            rel: "noreferrer",
            children: "View"
          }
        ) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "\u2014" }) }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(Link, { href: `/dashboard/lists/${list.id}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", children: "Edit" }) }) })
      ] });
    }) })
  ] }) });
};
var ListsTable_default = ListsTable;
export {
  ListsTable_default as default
};
