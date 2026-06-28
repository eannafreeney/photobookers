import { createRoute } from "hono-fsr";
import { claimCompleteQuerySchema } from "../../features/claims/schema";
import { queryValidator } from "../../lib/validator";
import { ClaimCompleteQueryContext } from "../../features/claims/types";
import { getUser, setFlash } from "../../utils";
import { getCreatorById } from "../../features/dashboard/creators/services";
import InfoPage from "../../pages/InfoPage";
import { showErrorAlert } from "../../lib/alertHelpers";
import { Context } from "hono";
import { isSameDomain, normalizeUrl } from "../../services/verification";
import {
  emailMatchesWebsite,
  sendCreatorVerifiedEmail,
} from "../../features/claims/utils";
import { createClaimWithStatus } from "../../features/claims/services";
import { assignUserAsCreatorOwnerAdmin } from "../../domain/claims/owner";
import { createCreatorClaimedNotification } from "../../domain/notifications/utils";

export const GET = createRoute(
  queryValidator(claimCompleteQuerySchema),
  async (c: Context) => {
    const user = await getUser(c);
    if (!user)
      return c.redirect(
        `/auth/login?redirectUrl=${encodeURIComponent(c.req.url)}`,
      );

    const typed = c as unknown as ClaimCompleteQueryContext;
    const { creatorId, verificationUrl } = typed.req.valid("query");

    const [creatorError, creator] = await getCreatorById(creatorId);
    if (creatorError || !creator) {
      return c.html(
        <InfoPage
          errorMessage={creatorError?.reason ?? "Creator not found"}
          user={user}
        />,
        404,
      );
    }
    if (!creator) return showErrorAlert(c, "Creator not found");
    if (creator.status !== "stub")
      return c.html(
        <InfoPage
          errorMessage="This profile is not available to claim."
          user={user}
        />,
        403,
      );

    const normalizedUrl = normalizeUrl(verificationUrl);
    if (creator.website && !isSameDomain(normalizedUrl, creator.website))
      return c.html(
        <InfoPage
          errorMessage="Verification URL does not match creator website."
          user={user}
        />,
      );

    const domainMatches = emailMatchesWebsite(user.email, normalizedUrl);
    const status =
      domainMatches && creator.website ? "approved" : "pending_admin_review";

    const [createClaimError, creatorClaim] = await createClaimWithStatus(
      user.id,
      creatorId,
      normalizedUrl,
      status,
    );
    if (createClaimError || !creatorClaim)
      return c.html(
        <InfoPage
          errorMessage={createClaimError?.reason ?? "Failed to create claim"}
          user={user}
        />,
        400,
      );

    await createCreatorClaimedNotification(user, creator);

    if (status === "approved") {
      const [error] = await assignUserAsCreatorOwnerAdmin(
        user.id,
        creatorId,
        true,
      );
      if (error) {
        return c.html(
          <InfoPage errorMessage={error.reason} user={user} />,
          400,
        );
      }
      await sendCreatorVerifiedEmail(user, creator);
      await setFlash(
        c,
        "success",
        "Your claim has been approved! Head to your dashboard to manage your profile.",
      );
      return c.redirect("/dashboard");
    }

    const [error] = await assignUserAsCreatorOwnerAdmin(user.id, creatorId);
    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 400);

    return c.redirect("/dashboard");
  },
);
