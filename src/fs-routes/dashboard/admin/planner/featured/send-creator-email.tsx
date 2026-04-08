import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendFeaturedCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { capitalize } from "../../../../../utils";
import {
  executeFeaturedEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { getFeaturedBooksForWeekQuery } from "../../../../../features/dashboard/admin/planner/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import SendFeaturedBookEmailButton from "../../../../../features/dashboard/admin/planner/components/SendFeaturedBookEmailButton";

export const POST = createRoute(
  formValidator(sendFeaturedCreatorEmailFormSchema),
  async (c) => {
    const { bookId, creatorId, weekStart, recipientType, featuredId } =
      c.req.valid("form");

    const featuredRows = await getFeaturedBooksForWeekQuery(weekStart);
    const featuredRow = featuredRows.find((r) => r.id === featuredId);
    if (!featuredRow) return showErrorAlert(c, "Featured book row not found");

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      bookId,
      recipientType,
      weekStart,
      action: "/dashboard/admin/planner/featured/set-send-email",
      title: `Send ${capitalize(recipientType)} Email`,
      targetId: `featured-email-${featuredRow.id}-${recipientType}`,
      featuredId,
      fallbackTargetNode: (
        <SendFeaturedBookEmailButton
          featuredBook={featuredRow}
          creatorId={creatorId}
          bookId={bookId}
          recipientType={recipientType}
        />
      ),
    });
    if (response || !creator) return response!;

    return executeFeaturedEmail({
      c,
      creator,
      weekStart,
      recipientType,
      bookId,
      featuredId,
    });
  },
);
