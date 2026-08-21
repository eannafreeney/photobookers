import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { checkIcon, plusIcon } from "../../../lib/icons.js";
import clsx from "clsx";
const ListMembershipRow = ({ bookId, list }) => {
  const id = `save-list-${bookId}-${list.id}`;
  const alreadyInList = list.containsBook;
  const alpineAttrs = alreadyInList ? {} : {
    "x-data": "{ isSubmitting: false }",
    "@ajax:before": "isSubmitting = true",
    "@ajax:after": "$dispatch('dialog:open'); isSubmitting = false",
    "@ajax:success": "$dispatch('save-menu:close')",
    "@ajax:error": "isSubmitting = false",
    "x-target": `${id} toast modal-root`,
    "x-target.error": "toast modal-root",
    "x-target.401": "modal-root"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      id,
      method: "post",
      action: alreadyInList ? void 0 : `/api/books/${bookId}/lists/${list.id}`,
      class: "w-full",
      ...alpineAttrs,
      children: [
        !alreadyInList ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "isInList", value: "false" }) : null,
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: alreadyInList ? "button" : "submit",
            disabled: alreadyInList,
            title: alreadyInList ? "Already in this list" : `Add to ${list.title}`,
            class: clsx(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer",
              alreadyInList ? "cursor-not-allowed opacity-50" : "hover:bg-surface-alt"
            ),
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  class: clsx(
                    "flex size-4 shrink-0 items-center justify-center",
                    alreadyInList ? "text-accent" : "text-on-surface-weak"
                  ),
                  children: alreadyInList ? checkIcon(4) : plusIcon(3)
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
export {
  ListMembershipRow
};
