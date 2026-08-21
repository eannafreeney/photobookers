import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import AuthModal from "../../../components/app/AuthModal.js";
import Modal from "../../../components/app/Modal.js";
import TextArea from "../../../components/forms/TextArea.js";
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
    return /* @__PURE__ */ jsx(AuthModal, { action: "to comment on this book." });
  }
  return /* @__PURE__ */ jsx(Modal, { title: "What did you love about this book?", children: /* @__PURE__ */ jsxs(
    "form",
    {
      method: "post",
      action: isEditMode ? `/api/books/${bookId}/comments/${commentId}` : `/api/books/${bookId}/comments`,
      class: "flex flex-col gap-4",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx(TextArea, { name: "body", minRows: 5, maxLength: 1e3, required: true }),
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
