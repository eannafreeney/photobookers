import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendBookCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { capitalize } from "../../../../../utils";
import {
  executeBOTWEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";

export const POST = createRoute(
  formValidator(sendBookCreatorEmailFormSchema),
  async (c) => {
    const { bookId, creatorId, weekStart, recipientType } = c.req.valid("form");
    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      bookId,
      recipientType,
      weekStart,
      action: "/dashboard/admin/planner/book-of-the-week/set-send-email",
      title: `Send ${capitalize(recipientType)} Email`,
    });
    if (response || !creator) return response!;

    return executeBOTWEmail({
      c,
      creator,
      weekStart,
      recipientType,
      bookId,
    });
  },
);
