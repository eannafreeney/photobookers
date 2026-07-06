import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { storeIdSchema } from "../../../../../features/dashboard/admin/stores/schema.js";
import { approveStore } from "../../../../../features/dashboard/admin/stores/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import StatusPill from "../../../../../features/dashboard/admin/components/StatusPill.js";
const POST = createRoute(
  paramValidator(storeIdSchema),
  async (c) => {
    const storeId = c.req.valid("param").storeId;
    const [error, updatedStore] = await approveStore(storeId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsx("div", { id: "store-approval-status", "x-merge": "morph", children: /* @__PURE__ */ jsx(StatusPill, { status: updatedStore.approvalStatus }) })
    );
  }
);
export {
  POST
};
