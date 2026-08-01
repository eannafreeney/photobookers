import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
const PrivateShelfListsStrip = ({
  lists,
  shelfSlug,
  shelfPublic
}) => {
  return /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-3 border border-outline bg-surface-alt p-4", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("h2", { class: "font-display text-xl font-medium text-on-surface-strong", children: "Your lists" }),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/lists", className: "text-sm text-accent", children: "Manage lists" })
    ] }),
    lists.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: "Create playlist-style lists in your dashboard, then add books with the + button on any book card." }) : /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-2", children: lists.map((list) => {
      const publicUrl = shelfPublic && shelfSlug && list.isPublic ? `/shelf/${shelfSlug}/lists/${list.slug}` : null;
      return /* @__PURE__ */ jsxs("li", { class: "flex items-center justify-between gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { class: "min-w-0", children: [
          /* @__PURE__ */ jsx(Link, { href: `/dashboard/lists/${list.id}`, children: /* @__PURE__ */ jsx("span", { class: "font-medium text-on-surface-strong", children: list.title }) }),
          /* @__PURE__ */ jsxs("span", { class: "ml-2 text-on-surface-weak tabular-nums", children: [
            list.bookCount,
            " books",
            list.isPublic ? " \xB7 Public" : " \xB7 Private"
          ] })
        ] }),
        publicUrl ? /* @__PURE__ */ jsx(
          "a",
          {
            href: publicUrl,
            class: "shrink-0 text-accent underline underline-offset-2",
            children: "View"
          }
        ) : null
      ] });
    }) })
  ] });
};
var PrivateShelfListsStrip_default = PrivateShelfListsStrip;
export {
  PrivateShelfListsStrip_default as default
};
