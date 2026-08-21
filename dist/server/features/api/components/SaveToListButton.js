import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { plusIcon } from "../../../lib/icons.js";
import { canWishlistBook } from "../../../lib/permissions.js";
import { isOk } from "../../../lib/result.js";
import { findWishlist } from "../services.js";
import { getListMembershipsForBook } from "../../../domain/lists/services.js";
import { userCanManageBookLists } from "../../../domain/lists/utils.js";
import clsx from "clsx";
import { ListMembershipRow } from "./ListMembershipRow.js";
import FavoritePopoverRow from "./FavoritePopoverRow.js";
const SaveToListButton = async ({ book, user, variant = "circle" }) => {
  let isFavorited = false;
  let lists = [];
  if (user?.id && userCanManageBookLists(user)) {
    isFavorited = isOk(await findWishlist(user.id, book.id));
    const [membershipsErr, memberships] = await getListMembershipsForBook(
      user.id,
      book.id
    );
    if (!membershipsErr && memberships) {
      lists = memberships;
    }
  } else if (user?.id) {
    isFavorited = isOk(await findWishlist(user.id, book.id));
  }
  const isDisabled = !canWishlistBook(user, book);
  const hasSaved = isFavorited || lists.some((l) => l.containsBook);
  const rootId = `save-to-list-${book.id}`;
  const canUseLists = userCanManageBookLists(user);
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "x-target": "modal-root",
    "x-target.401": "modal-root"
  };
  if (!user?.id) {
    return /* @__PURE__ */ jsxs(
      "form",
      {
        id: rootId,
        method: "post",
        action: `/api/books/${book.id}/wishlist`,
        class: variant === "circle" ? "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full bg-gray-200 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center cursor-pointer" : "whitespace-nowrap w-full rounded-radius border border-secondary px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center bg-transparent text-secondary cursor-pointer",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "isFavorited", value: "false" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              class: clsx(
                "cursor-pointer flex items-center justify-center gap-2 w-full",
                variant === "circle" && "disabled:opacity-30"
              ),
              title: "Save book",
              children: variant === "circle" ? plusIcon(4) : /* @__PURE__ */ jsxs(Fragment, { children: [
                "Save",
                plusIcon(4)
              ] })
            }
          )
        ]
      }
    );
  }
  const triggerClass = variant === "circle" ? clsx(
    "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full bg-gray-200 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center cursor-pointer",
    hasSaved && "ring-1 ring-accent"
  ) : clsx(
    "flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 cursor-pointer",
    hasSaved ? "border-on-surface-strong bg-on-surface-strong text-on-primary" : "border-secondary bg-transparent text-secondary"
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: rootId,
      class: clsx("relative", variant === "button" && "w-full"),
      ...{
        "x-data": `{ open: false }`,
        "x-on:keydown.escape.window": "open = false",
        "x-on:click.outside": "open = false",
        "x-on:save-menu:close": "open = false"
      },
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            class: triggerClass,
            title: "Save to list",
            ...{ "x-on:click.stop": "open = !open" },
            children: variant === "circle" ? plusIcon(4) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { children: "Save" }),
              plusIcon(4)
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            ...{
              "x-show": "open",
              "x-cloak": "",
              "x-transition": ""
            },
            class: "absolute right-0 bottom-full z-100 mb-1 w-56 rounded-radius border border-outline bg-surface shadow-lg",
            children: [
              /* @__PURE__ */ jsx("div", { class: "border-b border-outline py-1", children: /* @__PURE__ */ jsx(
                FavoritePopoverRow,
                {
                  bookId: book.id,
                  isFavorited,
                  isDisabled
                }
              ) }),
              canUseLists ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { class: "max-h-48 overflow-y-auto py-1", children: lists.length === 0 ? /* @__PURE__ */ jsx("p", { class: "px-3 py-2 text-xs text-on-surface-weak", children: "No lists yet. Create one in your dashboard." }) : lists.map((list) => /* @__PURE__ */ jsx(ListMembershipRow, { bookId: book.id, list })) }),
                /* @__PURE__ */ jsx("div", { class: "border-t border-outline py-1", children: /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "/dashboard/lists",
                    class: "block px-3 py-2 text-sm text-accent hover:bg-surface-alt",
                    children: "Manage lists"
                  }
                ) })
              ] }) : null
            ]
          }
        )
      ]
    }
  );
};
var SaveToListButton_default = SaveToListButton;
export {
  SaveToListButton_default as default
};
