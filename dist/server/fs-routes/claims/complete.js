import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { claimCompleteQuerySchema } from "../../features/claims/schema.js";
import { queryValidator } from "../../lib/validator.js";
import { getUser, setFlash } from "../../utils.js";
import { getCreatorById } from "../../features/dashboard/creators/services.js";
import InfoPage from "../../pages/InfoPage.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import { isSameDomain, normalizeUrl } from "../../services/verification.js";
import {
  emailMatchesWebsite,
  sendCreatorVerifiedEmail
} from "../../features/claims/utils.js";
import { createClaimWithStatus } from "../../features/claims/services.js";
import { assignUserAsCreatorOwnerAdmin } from "../../domain/claims/owner.js";
import { createCreatorClaimedNotification } from "../../domain/notifications/utils.js";
const GET = createRoute(
  queryValidator(claimCompleteQuerySchema),
  async (c) => {
    const user = await getUser(c);
    if (!user)
      return c.redirect(
        `/auth/login?redirectUrl=${encodeURIComponent(c.req.url)}`
      );
    const typed = c;
    const { creatorId, verificationUrl } = typed.req.valid("query");
    const [creatorError, creator] = await getCreatorById(creatorId);
    if (creatorError || !creator) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: creatorError?.reason ?? "Creator not found",
            user
          }
        ),
        404
      );
    }
    if (!creator) return showErrorAlert(c, "Creator not found");
    if (creator.status !== "stub")
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: "This profile is not available to claim.",
            user
          }
        ),
        403
      );
    const normalizedUrl = normalizeUrl(verificationUrl);
    if (creator.website && !isSameDomain(normalizedUrl, creator.website))
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: "Verification URL does not match creator website.",
            user
          }
        )
      );
    const domainMatches = emailMatchesWebsite(user.email, normalizedUrl);
    const status = domainMatches && creator.website ? "approved" : "pending_admin_review";
    const [createClaimError, creatorClaim] = await createClaimWithStatus(
      user.id,
      creatorId,
      normalizedUrl,
      status
    );
    if (createClaimError || !creatorClaim)
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: createClaimError?.reason ?? "Failed to create claim",
            user
          }
        ),
        400
      );
    await createCreatorClaimedNotification(user, creator);
    if (status === "approved") {
      const [error2] = await assignUserAsCreatorOwnerAdmin(
        user.id,
        creatorId,
        true
      );
      if (error2) {
        return c.html(
          /* @__PURE__ */ jsx(InfoPage, { errorMessage: error2.reason, user }),
          400
        );
      }
      await sendCreatorVerifiedEmail(user, creator);
      await setFlash(
        c,
        "success",
        "Your claim has been approved! Head to your dashboard to manage your profile."
      );
      return c.redirect("/dashboard");
    }
    const [error] = await assignUserAsCreatorOwnerAdmin(user.id, creatorId);
    if (error)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }), 400);
    return c.redirect("/dashboard");
  }
);
export {
  GET
};
