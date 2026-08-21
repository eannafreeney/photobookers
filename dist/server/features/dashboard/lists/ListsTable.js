import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import ListVisibilityToggle from "./ListVisibilityToggle.js";
import ListShareLink from "./ListShareLink.js";
import EditRowButton from "../../app/components/EditRowButton.js";
import DeleteRowButton from "../../app/components/DeleteRowButton.js";
import { isFavoritesListId } from "../../../domain/lists/utils.js";
import Link from "../../../components/app/Link.js";
const listPublicUrl = (list, shelfSlug, shelfPublic) => shelfPublic && shelfSlug && list.isPublic ? `/shelf/${shelfSlug}/lists/${list.slug}` : null;
const ListsTable = ({
  lists,
  ownerName,
  shelfSlug,
  shelfPublic,
  isMobile = false
}) => {
  const alpineAttrs = {
    "x-init": "true",
    "@lists:updated.window": "$ajax('/dashboard/lists', { target: 'lists-table-container' })"
  };
  if (lists.length === 0) {
    return /* @__PURE__ */ jsx("div", { "x-data": true, id: "lists-table-container", ...alpineAttrs, children: /* @__PURE__ */ jsxs("div", { class: "rounded border border-outline bg-surface-alt p-6 text-sm text-on-surface", children: [
      /* @__PURE__ */ jsx("p", { class: "mb-3", children: "You don\u2019t have any lists yet." }),
      /* @__PURE__ */ jsx("p", { class: "text-on-surface-weak", children: "Create a list like \u201CFavourite books of the year\u201D, then add books from any book card with the + button." })
    ] }) });
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(
      "ul",
      {
        "x-data": true,
        id: "lists-table-container",
        class: "flex flex-col gap-4",
        ...alpineAttrs,
        children: lists.map((list) => /* @__PURE__ */ jsx(
          ListCardMobile,
          {
            list,
            ownerName,
            publicUrl: listPublicUrl(list, shelfSlug, shelfPublic)
          }
        ))
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": true,
      id: "lists-table-container",
      class: "overflow-x-auto border border-outline",
      ...alpineAttrs,
      children: /* @__PURE__ */ jsxs("table", { class: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { class: "border-b border-outline bg-surface-alt kicker text-on-surface-weak", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Title" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Books" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Visibility" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium", children: "Share" }),
          /* @__PURE__ */ jsx("th", { class: "px-4 py-3 font-medium" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: lists.map((list) => {
          const isFavorites = isFavoritesListId(list.id);
          const publicUrl = listPublicUrl(list, shelfSlug, shelfPublic);
          return /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline last:border-0", children: [
            /* @__PURE__ */ jsxs("td", { class: "px-4 py-3", children: [
              /* @__PURE__ */ jsx("div", { class: "font-medium text-on-surface-strong", children: list.title }),
              isFavorites ? /* @__PURE__ */ jsx("p", { class: "mt-0.5 text-xs text-on-surface-weak", children: "Built-in \u2014 books you favorite" }) : list.description ? /* @__PURE__ */ jsx("p", { class: "mt-0.5 text-xs text-on-surface-weak line-clamp-1", children: list.description }) : null
            ] }),
            /* @__PURE__ */ jsx("td", { class: "px-4 py-3 tabular-nums", children: list.bookCount }),
            /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: isFavorites ? /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "Via shelf" }) : /* @__PURE__ */ jsx(ListVisibilityToggle, { list }) }),
            /* @__PURE__ */ jsx("td", { class: "px-4 py-3", children: publicUrl ? /* @__PURE__ */ jsx(
              ListShareLink,
              {
                listTitle: list.title,
                ownerName,
                publicUrl
              }
            ) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "\u2014" }) }),
            /* @__PURE__ */ jsx("td", { class: "px-4 py-3 text-right", children: isFavorites ? /* @__PURE__ */ jsx(
              Link,
              {
                href: "/dashboard/favorites",
                className: "text-sm text-accent",
                children: "Manage"
              }
            ) : /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsx(EditRowButton, { href: `/dashboard/lists/${list.id}` }),
              /* @__PURE__ */ jsx(
                DeleteRowButton,
                {
                  action: `/dashboard/lists/${list.id}`,
                  confirm: "Delete this list?"
                }
              )
            ] }) })
          ] });
        }) })
      ] })
    }
  );
};
const ListCardMobile = ({
  list,
  ownerName,
  publicUrl
}) => {
  const isFavorites = isFavoritesListId(list.id);
  return /* @__PURE__ */ jsx("li", { class: "rounded-radius border border-outline bg-surface overflow-hidden", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4 p-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface-strong", children: list.title }),
      isFavorites ? /* @__PURE__ */ jsx("p", { class: "mt-1 text-sm text-on-surface-weak", children: "Built-in \u2014 books you favorite" }) : list.description ? /* @__PURE__ */ jsx("p", { class: "mt-1 text-sm text-on-surface-weak line-clamp-2", children: list.description }) : null
    ] }),
    /* @__PURE__ */ jsxs("dl", { class: "grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm", children: [
      /* @__PURE__ */ jsx("dt", { class: "text-on-surface-weak", children: "Books" }),
      /* @__PURE__ */ jsx("dd", { class: "tabular-nums", children: list.bookCount }),
      /* @__PURE__ */ jsx("dt", { class: "text-on-surface-weak", children: "Visibility" }),
      /* @__PURE__ */ jsx("dd", { children: isFavorites ? /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "Via shelf" }) : /* @__PURE__ */ jsx(ListVisibilityToggle, { list }) }),
      /* @__PURE__ */ jsx("dt", { class: "text-on-surface-weak", children: "Share" }),
      /* @__PURE__ */ jsx("dd", { children: publicUrl ? /* @__PURE__ */ jsx(
        ListShareLink,
        {
          listTitle: list.title,
          ownerName,
          publicUrl
        }
      ) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak", children: "\u2014" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { class: "flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3", children: isFavorites ? /* @__PURE__ */ jsx(Link, { href: "/dashboard/favorites", className: "text-sm text-accent", children: "Manage" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(EditRowButton, { href: `/dashboard/lists/${list.id}` }),
      /* @__PURE__ */ jsx(
        DeleteRowButton,
        {
          action: `/dashboard/lists/${list.id}`,
          confirm: "Delete this list?"
        }
      )
    ] }) })
  ] }) });
};
var ListsTable_default = ListsTable;
export {
  ListsTable_default as default
};
