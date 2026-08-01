import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import { deleteIcon } from "../../../../../lib/icons.js";
const DeleteBookForm = ({ bookId, action }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Remove this book from the issue?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('li').remove()"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      action: `${action}/remove-book`,
      ...alpineAttrs,
      className: "shrink-0",
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            class: "text-danger hover:opacity-80",
            title: "Remove from issue",
            children: deleteIcon
          }
        )
      ]
    }
  );
};
var DeleteBookForm_default = DeleteBookForm;
export {
  DeleteBookForm_default as default
};
