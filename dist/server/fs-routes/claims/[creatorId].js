import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator, queryValidator } from "../../lib/validator.js";
import { creatorIdSchema, currentPathSchema } from "../../schemas/index.js";
import { getUser } from "../../utils.js";
import { getCreatorById } from "../../features/dashboard/creators/services.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import Modal from "../../components/app/Modal.js";
import ClaimSignupModal from "../../features/claims/modals/ClaimSignUpModal.js";
import ClaimCreatorBtn from "../../features/claims/components/ClaimCreatorBtn.js";
import ClaimModal from "../../features/claims/modals/ClaimModal.js";
import { normalizeUrl } from "../../services/verification.js";
import { isSameDomain } from "../../services/verification.js";
import {
  emailMatchesWebsite,
  sendCreatorVerifiedEmail
} from "../../features/claims/utils.js";
import { createClaimWithStatus } from "../../features/claims/services.js";
import { assignUserAsCreatorOwnerAdmin } from "../../domain/claims/owner.js";
import { showSuccessAlert } from "../../lib/alertHelpers.js";
import Alert from "../../components/app/Alert.js";
const GET = createRoute(
  paramValidator(creatorIdSchema),
  queryValidator(currentPathSchema),
  async (c) => {
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
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Modal, { title: "Claim this creator profile", children: /* @__PURE__ */ jsx(
            ClaimSignupModal,
            {
              creatorId,
              creatorWebsite: creator.website ?? null,
              currentPath
            }
          ) }),
          /* @__PURE__ */ jsx(
            ClaimCreatorBtn,
            {
              creator,
              user,
              currentPath
            }
          ),
          /* @__PURE__ */ jsx("div", { id: "toast" })
        ] }),
        200
      );
    }
    if (!creator) return showErrorAlert(c, "Creator Not Found");
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Modal, { children: /* @__PURE__ */ jsx(
          ClaimModal,
          {
            creatorId,
            user,
            creatorWebsite: creator.website ?? ""
          }
        ) }),
        /* @__PURE__ */ jsx(
          ClaimCreatorBtn,
          {
            creator,
            user,
            currentPath
          }
        ),
        /* @__PURE__ */ jsx("div", { id: "toast" })
      ] })
    );
  }
);
const POST = createRoute(
  paramValidator(creatorIdSchema),
  queryValidator(currentPathSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const creatorId = c.req.valid("param").creatorId;
    const user = await getUser(c);
    const [creatorError, creator] = await getCreatorById(creatorId);
    if (creatorError || !creator) {
      return showErrorAlert(c, "Creator not found");
    }
    const rawUrl = creator.website ?? formData.verificationUrl;
    const verificationUrl = rawUrl ? normalizeUrl(rawUrl) : null;
    if (creator.website && verificationUrl && !isSameDomain(verificationUrl, creator.website)) {
      return showErrorAlert(
        c,
        `The URL must match the creator's listed website (${creator.website}).`
      );
    }
    const domainMatches = verificationUrl ? emailMatchesWebsite(user.email, verificationUrl) : false;
    const status = domainMatches && creator.website ? "approved" : "pending_admin_review";
    const [createClaimError, creatorClaim] = await createClaimWithStatus(
      user.id,
      creatorId,
      verificationUrl,
      status
    );
    if (createClaimError || !creatorClaim)
      return showErrorAlert(
        c,
        createClaimError?.reason ?? "Failed to create claim"
      );
    if (status === "approved") {
      await assignUserAsCreatorOwnerAdmin(user.id, creatorId, true);
      await sendCreatorVerifiedEmail(user, creator);
      return showSuccessAlert(
        c,
        "Your claim has been approved! Head to your dashboard to manage your profile."
      );
    }
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "info",
            message: "Your claim has been submitted for review. We'll notify you once it's approved."
          }
        ),
        /* @__PURE__ */ jsx(ClaimCreatorBtn, { creator, user })
      ] })
    );
  }
);
export {
  GET,
  POST
};
