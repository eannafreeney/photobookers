import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import Modal from "../../../components/app/Modal.js";
const CommentModal = ({
  bookId,
  user,
  formValues,
  commentId
}) => {
  const isEditMode = !!formValues;
  const alpineAttrs = {
    "x-data": `commentForm({initialValues: ${JSON.stringify(formValues)}})`,
    "x-target": "modal-root",
    "x-target.error": "toast",
    "x-target.401": "modal-root",
    "@ajax:after": "$dispatch('comments:updated'), $dispatch('dialog:close')"
  };
  if (!user) {
    return /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Log in to add a comment." });
  }
  return /* @__PURE__ */ jsx(Modal, { title: "What did you love about this book?", children: /* @__PURE__ */ jsxs(
    "form",
    {
      method: "post",
      action: isEditMode ? `/api/books/${bookId}/comments/${commentId}` : `/api/books/${bookId}/comments`,
      class: "flex flex-col gap-4",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("label", { class: "bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary", children: /* @__PURE__ */ jsx(
          "textarea",
          {
            class: "w-full bg-surface-alt px-2.5 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
            name: "body",
            "x-model": "body",
            "x-autosize": true,
            required: true
          }
        ) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "_method",
            value: isEditMode ? "PATCH" : "POST"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "solid",
            color: "primary",
            width: "fit",
            isDisabled: !user.profileImageUrl,
            "x-bind:disabled": "!isFormValid",
            children: isEditMode ? "Update Comment" : "Add Comment"
          }
        )
      ]
    }
  ) });
};
var CommentModal_default = CommentModal;
export {
  CommentModal_default as default
};
