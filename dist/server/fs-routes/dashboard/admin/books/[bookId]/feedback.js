import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import z from "zod";
import Alert from "../../../../../components/app/Alert.js";
import Button from "../../../../../components/app/Button.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import Modal from "../../../../../components/app/Modal.js";
import { sendBookFeedback } from "../../../../../features/dashboard/admin/books/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { bookIdSchema } from "../../../../../schemas/index.js";
const feedbackFormSchema = z.object({
  feedback: z.string().trim().min(1, "Feedback is required")
});
const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const { bookId } = c.req.valid("param");
  return c.html(
    /* @__PURE__ */ jsx(Modal, { title: "Send feedback", children: /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/admin/books/${bookId}/feedback`,
        "x-target": "toast",
        ...{ "x-on:ajax:after": "$dispatch('dialog:close')" },
        children: [
          /* @__PURE__ */ jsx(TextArea, { label: "Feedback", name: "feedback", required: true }),
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
            /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Send feedback" })
          ] })
        ]
      }
    ) })
  );
});
const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(feedbackFormSchema),
  async (c) => {
    const { bookId } = c.req.valid("param");
    const { feedback } = c.req.valid("form");
    const [error] = await sendBookFeedback(bookId, feedback);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Feedback sent!" })
    );
  }
);
export {
  GET,
  POST
};
