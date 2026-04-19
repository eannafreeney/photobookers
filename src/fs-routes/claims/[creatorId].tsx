import { createRoute } from "hono-fsr";
import { paramValidator, queryValidator } from "../../lib/validator";
import { creatorIdSchema, currentPathSchema } from "../../schemas";
import { ClaimModalContext } from "../../features/claims/types";
import { getUser } from "../../utils";
import { getCreatorById } from "../../features/dashboard/creators/services";
import { showErrorAlert } from "../../lib/alertHelpers";
import Modal from "../../components/app/Modal";
import ClaimSignupModal from "../../features/claims/modals/ClaimSignUpModal";
import ClaimCreatorBtn from "../../features/claims/components/ClaimCreatorBtn";
import ClaimModal from "../../features/claims/modals/ClaimModal";
import { ProcessClaimContext } from "../../features/claims/types";
import { normalizeUrl } from "../../services/verification";
import { isSameDomain } from "../../services/verification";
import { emailMatchesWebsite } from "../../features/claims/utils";
import { createClaimWithStatus } from "../../features/claims/services";
import { assignUserAsCreatorOwnerAdmin } from "../../features/dashboard/admin/claims/services";
import { showSuccessAlert } from "../../lib/alertHelpers";
import Alert from "../../components/app/Alert";

export const GET = createRoute(
  paramValidator(creatorIdSchema),
  queryValidator(currentPathSchema),
  async (c: ClaimModalContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const currentPath = c.req.valid("query").currentPath;
    const user = await getUser(c);
    const userId = user?.id;

    const [error, creator] = await getCreatorById(creatorId);
    if (error || !creator) {
      return showErrorAlert(c, "Creator not found");
    }

    if (!userId) {
      if (!creator) return showErrorAlert(c, "Creator Not Found");
      if (creator.status !== "stub")
        return showErrorAlert(c, "This profile is not available to claim.");

      return c.html(
        <>
          <Modal title="Claim this creator profile">
            <ClaimSignupModal
              creatorId={creatorId}
              creatorWebsite={creator.website ?? null}
              currentPath={currentPath}
            />
          </Modal>
          <ClaimCreatorBtn
            creator={creator}
            user={user}
            currentPath={currentPath}
          />
          <div id="toast"></div>
        </>,
        200,
      );
    }

    if (!creator) return showErrorAlert(c, "Creator Not Found");

    return c.html(
      <>
        <Modal>
          <ClaimModal
            creatorId={creatorId}
            user={user}
            creatorWebsite={creator.website ?? ""}
          />
        </Modal>
        <ClaimCreatorBtn
          creator={creator}
          user={user}
          currentPath={currentPath}
        />
        <div id="toast"></div>
      </>,
    );
  },
);

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  queryValidator(currentPathSchema),
  async (c: ProcessClaimContext) => {
    const formData = c.req.valid("form");
    const creatorId = c.req.valid("param").creatorId;
    const user = await getUser(c);

    const [creatorError, creator] = await getCreatorById(creatorId);
    if (creatorError || !creator) {
      return showErrorAlert(c, "Creator not found");
    }
    // Use creator's existing website, or fall back to user-submitted URL
    const rawUrl = creator.website ?? formData.verificationUrl;
    const verificationUrl = rawUrl ? normalizeUrl(rawUrl) : null;
    // If creator has a listed website, enforce it — don't let user swap it
    if (
      creator.website &&
      verificationUrl &&
      !isSameDomain(verificationUrl, creator.website)
    ) {
      return showErrorAlert(
        c,
        `The URL must match the creator's listed website (${creator.website}).`,
      );
    }
    const domainMatches = verificationUrl
      ? emailMatchesWebsite(user.email, verificationUrl)
      : false;
    const status =
      domainMatches && creator.website ? "approved" : "pending_admin_review";

    const [createClaimError, creatorClaim] = await createClaimWithStatus(
      user.id,
      creatorId,
      verificationUrl,
      status,
    );
    if (createClaimError || !creatorClaim)
      return showErrorAlert(
        c,
        createClaimError?.reason ?? "Failed to create claim",
      );

    if (status === "approved") {
      await assignUserAsCreatorOwnerAdmin(user.id, creatorId, true);
      // Optionally send a welcome email here
      return showSuccessAlert(
        c,
        "Your claim has been approved! Head to your dashboard to manage your profile.",
      );
    }

    // pending_admin_review
    return c.html(
      <>
        <Alert
          type="info"
          message="Your claim has been submitted for review. We'll notify you once it's approved."
        />
        <ClaimCreatorBtn creator={creator} user={user} />
      </>,
    );
  },
);
