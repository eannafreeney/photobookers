import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import ListPromoteToggleForm from "./ListPromoteToggleForm.js";
const AdminListsTable = ({ lists }) => {
  if (lists.length === 0) {
    return /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: "No public lists found." });
  }
  return /* @__PURE__ */ jsx("div", { class: "overflow-x-auto border border-outline", children: /* @__PURE__ */ jsxs("table", { class: "w-full text-left text-sm", children: [
    /* @__PURE__ */ jsx("thead", { class: "border-b border-outline bg-surface-alt kicker text-on-surface-weak", children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Title" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Owner" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Books" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Public URL" }),
      /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Homepage" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: lists.map((list) => {
      const publicUrl = list.owner.shelfPublic && list.owner.shelfSlug ? `/shelf/${list.owner.shelfSlug}/lists/${list.slug}` : null;
      return /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline last:border-0", children: [
        /* @__PURE__ */ jsxs("td", { class: "px-4 py-3", children: [
          /* @__PURE__ */ jsx("div", { class: "font-medium text-on-surface-strong", children: list.title }),
          list.description ? /* @__PURE__ */ jsx("p", { class: "mt-0.5 text-xs text-on-surface-weak line-clamp-1", children: list.description }) : null
        ] }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: list.owner.displayName }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3 tabular-nums", children: list.bookCount }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: publicUrl ? /* @__PURE__ */ jsx(
          "a",
          {
            href: publicUrl,
            class: "text-accent underline underline-offset-2",
            target: "_blank",
            rel: "noreferrer",
            children: "View"
          }
        ) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "Shelf private" }) }),
        /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: /* @__PURE__ */ jsx(
          ListPromoteToggleForm,
          {
            listId: list.id,
            isPromoted: list.isPromoted,
            canPromote: list.canPromote
          }
        ) })
      ] });
    }) })
  ] }) });
};
var AdminListsTable_default = AdminListsTable;
export {
  AdminListsTable_default as default
};
