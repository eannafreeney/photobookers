import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { bookIdSchema } from "../../../../../schemas/index.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import {
  rejectBook
} from "../../../../../features/dashboard/admin/books/services.js";
import BookApprovalStatusPill from "../../../../../features/dashboard/admin/books/components/BookApprovalStatusPill.js";
import Alert from "../../../../../components/app/Alert.js";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import z from "zod";
import Button from "../../../../../components/app/Button.js";
import PublishToggleForm from "../../../../../features/dashboard/books/components/PublishToggleForm.js";
import { getUser } from "../../../../../utils.js";
const rejectBookFormSchema = z.object({
  feedback: z.string().optional()
});
const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const { bookId } = c.req.valid("param");
  const alpineAttrs = {
    "x-target": "toast book-approval-status book-publish-toggle",
    "@ajax:after": "$dispatch('dialog:close')"
  };
  return c.html(
    /* @__PURE__ */ jsx(Modal, { title: "Reject book / Send feedback", children: /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/admin/books/${bookId}/reject`,
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx(TextArea, { name: "feedback" }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
          /* @__PURE__ */ jsxs("div", { class: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                color: "inverse",
                type: "button",
                "x-on:click": "$dispatch('dialog:close')",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(Button, { variant: "solid", color: "danger", children: "Send feedback & reject" })
          ] })
        ]
      }
    ) })
  );
});
const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(rejectBookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const { bookId } = c.req.valid("param");
    const { feedback } = c.req.valid("form");
    const [error, book] = await rejectBook(bookId, feedback);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book rejected!" }),
        /* @__PURE__ */ jsx(
          BookApprovalStatusPill,
          {
            approvalStatus: book.approvalStatus ?? "rejected"
          }
        ),
        /* @__PURE__ */ jsx(PublishToggleForm, { book, user })
      ] })
    );
  }
);
export {
  GET,
  POST
};
