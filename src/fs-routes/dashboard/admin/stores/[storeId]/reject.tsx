import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { storeIdSchema } from "../../../../../features/dashboard/admin/stores/schema";
import { rejectStore } from "../../../../../features/dashboard/admin/stores/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { StoreIdContext } from "../../../../../features/dashboard/admin/stores/types";
import StatusPill from "../../../../../features/dashboard/admin/components/StatusPill";

export const POST = createRoute(
  paramValidator(storeIdSchema),
  async (c: StoreIdContext) => {
    const storeId = c.req.valid("param").storeId;

    const [error, updatedStore] = await rejectStore(storeId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <div id="store-approval-status" x-merge="morph">
        <StatusPill status={updatedStore.approvalStatus} />
      </div>,
    );
  },
);
