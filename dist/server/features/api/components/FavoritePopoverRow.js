import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { emptyHeartIcon, fullHeartIcon } from "../../../lib/icons.js";
const FavoritePopoverRow = ({ bookId, isFavorited, isDisabled }) => {
  const id = `save-fav-${bookId}`;
  const alpineAttrs = {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:error": "isSubmitting = false",
    "@ajax:success": "$dispatch('save-menu:close')",
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast modal-root",
    "x-target.401": "modal-root"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      id,
      method: "post",
      action: `/api/books/${bookId}/wishlist`,
      class: "w-full",
      ...alpineAttrs,
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
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "shouldRefreshWishlist", value: "true" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: isDisabled,
            class: "cursor-pointer flex w-full items-center justify-start gap-2 px-3 py-2 text-left text-sm hover:bg-surface-alt disabled:opacity-50",
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
var FavoritePopoverRow_default = FavoritePopoverRow;
export {
  FavoritePopoverRow_default as default
};
