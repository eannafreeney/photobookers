import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { fairIdSchema } from "../../../../../features/dashboard/admin/fairs/schema.js";
import { rejectFair } from "../../../../../features/dashboard/admin/fairs/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { z } from "zod";
import Modal from "../../../../../components/app/Modal.js";
import StatusPill from "../../../../../features/dashboard/admin/components/StatusPill.js";
import Button from "../../../../../components/app/Button.js";
const rejectFeedbackSchema = z.object({
  feedback: z.string().optional()
});
const GET = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = c.req.param("fairId");
    return c.html(
      /* @__PURE__ */ jsx(Modal, { title: "Reject Fair", children: /* @__PURE__ */ jsxs(
        "form",
        {
          method: "post",
          action: `/dashboard/admin/fairs/${fairId}/reject`,
          "x-target": "fair-approval-status",
          children: [
            /* @__PURE__ */ jsxs("div", { class: "mb-4", children: [
              /* @__PURE__ */ jsx("label", { for: "feedback", class: "block mb-2", children: "Feedback (optional)" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  name: "feedback",
                  id: "feedback",
                  rows: 4,
                  class: "w-full p-2 border rounded",
                  placeholder: "Provide feedback about why this fair was rejected..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { class: "flex gap-2 justify-end", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  color: "secondary",
                  type: "button",
                  "x-on:click": "$dispatch('dialog:close')",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(Button, { variant: "solid", color: "danger", children: "Reject Fair" })
            ] })
          ]
        }
      ) })
    );
  }
);
const POST = createRoute(
  formValidator(rejectFeedbackSchema),
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = c.req.valid("param").fairId;
    const formData = c.req.valid("form");
    const [error, updatedFair] = await rejectFair(fairId, formData.feedback);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsx("div", { id: "fair-approval-status", "x-merge": "morph", children: /* @__PURE__ */ jsx(StatusPill, { status: updatedFair.approvalStatus }) })
    );
  }
);
export {
  GET,
  POST
};
