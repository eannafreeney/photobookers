import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator.js";
import { sendAOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import {
  executeAOTWEmail,
  requireCreatorEmailOrRenderModal
} from "../../../../../features/dashboard/admin/planner/emailFlow.js";
import { getArtistOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services.js";
import { buildSpotlightEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders.js";
import { renderPlannerEmailSuccess } from "../../../../../features/dashboard/admin/planner/renderPlannerEmailSuccess.js";
import EmailStatusBadge from "../../../../../features/dashboard/admin/planner/components/EmailStatusBadge.js";
import { sendManualSpotlightEmail } from "../../../../../features/dashboard/admin/planner/spotlightEmailServices.js";
import { getUser } from "../../../../../utils.js";
const POST = createRoute(
  formValidator(sendAOTWCreatorEmailFormSchema),
  async (c) => {
    const { creatorId, weekStart, emailKind } = c.req.valid("form");
    const [aotwErr, aotwRow] = await getArtistOfTheWeekForDateQuery(weekStart);
    if (aotwErr || !aotwRow)
      return showErrorAlert(c, "Artist of the week not found");
    const badge = buildSpotlightEmailBadgeProps({
      spotlight: "artist",
      row: aotwRow,
      creatorId,
      email: aotwRow.creator?.email ?? null,
      emailKind
    });
    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      weekStart,
      action: `/dashboard/admin/planner/artist-of-the-week/set-send-email`,
      title: `Send Artist Email`,
      targetId: badge.targetId,
      fallbackTargetNode: /* @__PURE__ */ jsx(EmailStatusBadge, { ...badge })
    });
    if (response) return response;
    if (!creator) return showErrorAlert(c, "Creator not found");
    if (emailKind === "advance") {
      return executeAOTWEmail({ c, creator, creatorId, weekStart, badge });
    }
    const user = await getUser(c);
    if (!user) return showErrorAlert(c, "Not signed in");
    const [sendError, updatedRow] = await sendManualSpotlightEmail(
      "artist",
      weekStart,
      emailKind,
      user.id
    );
    if (sendError) return showErrorAlert(c, sendError.reason);
    if (!updatedRow) return showErrorAlert(c, "Artist of the week not found");
    const updatedBadge = buildSpotlightEmailBadgeProps({
      spotlight: "artist",
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
