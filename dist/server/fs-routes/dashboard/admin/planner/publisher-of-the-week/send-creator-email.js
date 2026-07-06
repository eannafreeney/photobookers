import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator.js";
import { sendPOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import {
  executePOTWEmail,
  requireCreatorEmailOrRenderModal
} from "../../../../../features/dashboard/admin/planner/emailFlow.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { getPublisherOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services.js";
import { buildSpotlightEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders.js";
import { renderPlannerEmailSuccess } from "../../../../../features/dashboard/admin/planner/renderPlannerEmailSuccess.js";
import EmailStatusBadge from "../../../../../features/dashboard/admin/planner/components/EmailStatusBadge.js";
import { sendManualSpotlightEmail } from "../../../../../features/dashboard/admin/planner/spotlightEmailServices.js";
import { getUser } from "../../../../../utils.js";
const POST = createRoute(
  formValidator(sendPOTWCreatorEmailFormSchema),
  async (c) => {
    const { creatorId, weekStart, emailKind } = c.req.valid("form");
    const [potwErr, potwRow] = await getPublisherOfTheWeekForDateQuery(weekStart);
    if (potwErr || !potwRow)
      return showErrorAlert(c, "Publisher of the week not found");
    const badge = buildSpotlightEmailBadgeProps({
      spotlight: "publisher",
      row: potwRow,
      creatorId,
      email: potwRow.creator?.email ?? null,
      emailKind
    });
    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      weekStart,
      action: "/dashboard/admin/planner/publisher-of-the-week/set-send-email",
      title: "Send Publisher Email",
      targetId: badge.targetId,
      fallbackTargetNode: /* @__PURE__ */ jsx(EmailStatusBadge, { ...badge })
    });
    if (response || !creator) return response;
    if (emailKind === "advance") {
      return executePOTWEmail({ c, creator, creatorId, weekStart, badge });
    }
    const user = await getUser(c);
    if (!user) return showErrorAlert(c, "Not signed in");
    const [sendError, updatedRow] = await sendManualSpotlightEmail(
      "publisher",
      weekStart,
      emailKind,
      user.id
    );
    if (sendError) return showErrorAlert(c, sendError.reason);
    if (!updatedRow) return showErrorAlert(c, "Publisher of the week not found");
    const updatedBadge = buildSpotlightEmailBadgeProps({
      spotlight: "publisher",
      row: updatedRow,
      creatorId,
      email: updatedRow.creator?.email ?? creator.email,
      emailKind
    });
    return renderPlannerEmailSuccess(c, creator, {
      ...updatedBadge,
      hasEmail: true
    });
  }
);
export {
  POST
};
