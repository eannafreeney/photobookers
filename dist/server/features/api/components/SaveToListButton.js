import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  checkIcon,
  emptyHeartIcon,
  fullHeartIcon,
  plusIcon
} from "../../../lib/icons.js";
import { canWishlistBook } from "../../../lib/permissions.js";
import { isOk } from "../../../lib/result.js";
import { findWishlist } from "../services.js";
import { getListMembershipsForBook } from "../../../domain/lists/services.js";
import clsx from "clsx";
const FavoritePopoverRow = ({
  bookId,
  isFavorited,
  isDisabled
}) => {
  const id = `save-fav-${bookId}`;
  return /* @__PURE__ */ jsxs(
    "form",
    {
      id,
      method: "post",
      action: `/api/books/${bookId}/wishlist`,
      class: "w-full",
      "x-data": "{ isSubmitting: false }",
      ...{
        "@ajax:before": "isSubmitting = true",
        "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
        "@ajax:error": "isSubmitting = false",
        "x-target": `${id} toast modal-root`,
        "x-target.error": "toast modal-root",
        "x-target.401": "modal-root"
      },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "isFavorited",
            value: isFavorited ? "true" : "false"
          }
        ),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "variant", value: "popover" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: isDisabled,
            class: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-alt disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxs("span", { class: "shrink-0", children: [
                /* @__PURE__ */ jsx("span", { "x-show": isFavorited ? "isSubmitting" : "!isSubmitting", "x-cloak": true, children: emptyHeartIcon(4) }),
                /* @__PURE__ */ jsx("span", { "x-show": isFavorited ? "!isSubmitting" : "isSubmitting", "x-cloak": true, children: fullHeartIcon(4) })
              ] }),
              /* @__PURE__ */ jsx("span", { children: isFavorited ? "Favorited" : "Favorite" })
            ]
          }
        )
      ]
    }
  );
};
const ListMembershipRow = ({
  bookId,
  list
}) => {
  const id = `save-list-${bookId}-${list.id}`;
  return /* @__PURE__ */ jsxs(
    "form",
    {
      id,
      method: "post",
      action: `/api/books/${bookId}/lists/${list.id}`,
      class: "w-full",
      "x-data": "{ isSubmitting: false }",
      ...{
        "@ajax:before": "isSubmitting = true",
        "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
        "@ajax:error": "isSubmitting = false",
        "x-target": `${id} toast modal-root`,
        "x-target.error": "toast modal-root",
        "x-target.401": "modal-root"
      },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "isInList",
            value: list.containsBook ? "true" : "false"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            class: "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-alt",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  class: clsx(
                    "flex size-4 shrink-0 items-center justify-center",
                    list.containsBook ? "text-accent" : "text-on-surface-weak"
                  ),
                  children: list.containsBook ? checkIcon(4) : plusIcon(3)
                }
              ),
              /* @__PURE__ */ jsx("span", { class: "min-w-0 truncate", children: list.title })
            ]
          }
        )
      ]
    }
  );
};
const SaveToListButton = async ({
  book,
  user,
  variant = "circle"
}) => {
  let isFavorited = false;
  let lists = [];
  if (user?.id) {
    isFavorited = isOk(await findWishlist(user.id, book.id));
    lists = await getListMembershipsForBook(user.id, book.id);
  }
  const isDisabled = !canWishlistBook(user, book);
  const hasSaved = isFavorited || lists.some((l) => l.containsBook);
  const rootId = `save-to-list-${book.id}`;
  if (!user?.id) {
    const loginForm = /* @__PURE__ */ jsxs(
      "form",
      {
        id: rootId,
        method: "post",
        action: `/api/books/${book.id}/wishlist`,
        class: variant === "circle" ? "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full bg-gray-200 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center cursor-pointer" : "whitespace-nowrap w-full rounded-radius border border-secondary px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center bg-transparent text-secondary",
        "x-data": "{ isSubmitting: false }",
        ...{
          "@ajax:before": "isSubmitting = true",
          "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
          "@ajax:error": "isSubmitting = false",
          "x-target": "modal-root",
          "x-target.401": "modal-root"
        },
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
    return loginForm;
  }
  const triggerClass = variant === "circle" ? clsx(
    "inline-flex justify-center items-center aspect-square whitespace-nowrap size-8 rounded-full bg-gray-200 p-1 text-sm font-medium tracking-wide text-on-surface-dark transition hover:opacity-75 text-center cursor-pointer",
    hasSaved && "ring-1 ring-accent"
  ) : clsx(
    "flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75",
    hasSaved ? "border-on-surface-strong bg-on-surface-strong text-on-primary" : "border-secondary bg-transparent text-secondary"
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id: rootId,
      class: "relative",
      "x-data": "saveToList",
      ...{ "@keydown.escape.window": "close()" },
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            class: triggerClass,
            title: "Save to list",
            ...{ "@click": "toggle()" },
            children: variant === "circle" ? plusIcon(4) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { children: "Save" }),
              plusIcon(4)
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            "x-show": "open",
            "x-cloak": true,
            ...{
              "@click.outside": "close()",
              "x-transition": true
            },
            class: "absolute right-0 z-30 mt-2 w-56 rounded-radius border border-outline bg-surface shadow-lg",
            children: [
              /* @__PURE__ */ jsx("div", { class: "border-b border-outline py-1", children: /* @__PURE__ */ jsx(
                FavoritePopoverRow,
                {
                  bookId: book.id,
                  isFavorited,
                  isDisabled
                }
              ) }),
              /* @__PURE__ */ jsx("div", { class: "max-h-48 overflow-y-auto py-1", children: lists.length === 0 ? /* @__PURE__ */ jsx("p", { class: "px-3 py-2 text-xs text-on-surface-weak", children: "No lists yet. Create one in your dashboard." }) : lists.map((list) => /* @__PURE__ */ jsx(ListMembershipRow, { bookId: book.id, list })) }),
              /* @__PURE__ */ jsx("div", { class: "border-t border-outline py-1", children: /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/dashboard/lists",
                  class: "block px-3 py-2 text-sm text-accent hover:bg-surface-alt",
                  children: "Manage lists"
                }
              ) })
            ]
          }
        )
      ]
    }
  );
};
var SaveToListButton_default = SaveToListButton;
export {
  FavoritePopoverRow,
  ListMembershipRow,
  SaveToListButton_default as default
};
