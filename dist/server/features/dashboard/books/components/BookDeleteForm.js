import { jsx } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import { canDeleteBook } from "../../../../lib/permissions.js";
import FormDelete from "../../../../components/forms/FormDelete.js";
const DeleteBookForm = ({ book, user }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax.success": "$dispatch('books:updated')"
  };
  return /* @__PURE__ */ jsx(FormDelete, { action: `/dashboard/books/${book.id}`, ...alpineAttrs, children: /* @__PURE__ */ jsx(
    Button,
    {
      variant: "outline",
      color: "danger",
      isDisabled: !canDeleteBook(user, book),
      children: /* @__PURE__ */ jsx("span", { children: "Delete" })
    }
  ) });
};
var BookDeleteForm_default = DeleteBookForm;
export {
  BookDeleteForm_default as default
};
