import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { fairIdSchema } from "../../../../../features/dashboard/admin/fairs/schema.js";
import { approveFair } from "../../../../../features/dashboard/admin/fairs/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import StatusPill from "../../../../../features/dashboard/admin/components/StatusPill.js";
const POST = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = c.req.valid("param").fairId;
    const [error, updatedFair] = await approveFair(fairId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsx("div", { id: "fair-approval-status", "x-merge": "morph", children: /* @__PURE__ */ jsx(StatusPill, { status: updatedFair.approvalStatus }) })
    );
  }
);
export {
  POST
};
