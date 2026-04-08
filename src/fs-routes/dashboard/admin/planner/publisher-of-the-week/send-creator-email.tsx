import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendPOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import {
  executePOTWEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";

export const POST = createRoute(
  formValidator(sendPOTWCreatorEmailFormSchema),
  async (c) => {
    const { creatorId, weekStart } = c.req.valid("form");

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      weekStart,
      action: "/dashboard/admin/planner/publisher-of-the-week/set-send-email",
      title: "Send Publisher Email",
    });
    if (response || !creator) return response!;

    return executePOTWEmail({ c, creator, creatorId, weekStart });
  },
);
