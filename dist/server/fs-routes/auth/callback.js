import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { queryValidator } from "../../lib/validator.js";
import { processRegisterQuerySchema } from "../../features/auth/schema.js";
import {
  getCallbackErrorMessage,
  getPendingCreatorId,
  getPendingVerificationUrl,
  verifyOtpForSignup
} from "../../features/auth/utils.js";
import {
  createUserInDatabase,
  setCookiesAndVerifyUser
} from "../../features/auth/services.js";
import { createStubCreatorProfile } from "../../features/dashboard/creators/services.js";
import { createUserVerifiedNotification } from "../../domain/notifications/utils.js";
import { sendEmail } from "../../lib/sendEmail.js";
import { generateVerificationWelcomeEmail } from "../../features/auth/emails.js";
import { setFlash } from "../../utils.js";
import InfoPage from "../../pages/InfoPage.js";
import { nanoid } from "nanoid";
import { createCreatorInterviewInviteAdmin } from "../../features/dashboard/admin/creators/services.js";
const GET = createRoute(
  queryValidator(processRegisterQuerySchema),
  async (c) => {
    const tokenHash = c.req.valid("query").token_hash;
    const error = c.req.valid("query").error;
    const errorCode = c.req.valid("query").error_code;
    const errorDescription = c.req.valid("query").error_description;
    if (error || errorCode) {
      const message = getCallbackErrorMessage(
        error,
        errorCode,
        errorDescription
      );
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: message }));
    }
    if (!tokenHash)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: getCallbackErrorMessage() }));
    const [signupError, session] = await verifyOtpForSignup(c, tokenHash);
    if (signupError) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: signupError.reason }));
    }
    const { user } = session;
    const type = user.user_metadata?.type;
    const isCreator = type === "artist" || type === "publisher";
    await setCookiesAndVerifyUser(c, session);
    if (!user.email)
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Failed to create account. Please try again." })
      );
    const mustResetPassword = user.user_metadata?.claimIntent ?? false;
    const [dbError, dbUser] = await createUserInDatabase(session, {
      mustResetPassword
    });
    if (dbError) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: dbError.reason }));
    let interviewLink = null;
    if (isCreator) {
      const [newCreatorError, newCreator] = await createStubCreatorProfile(session);
      if (newCreatorError)
        return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: newCreatorError.reason }));
      const inviteToken = nanoid(32);
      const [interviewError] = await createCreatorInterviewInviteAdmin({
        creatorId: newCreator.id,
        creatorSlug: newCreator.slug,
        recipientEmail: user.email,
        invitedByUserId: user.id,
        inviteToken,
        interviewType: "introduction"
      });
      if (interviewError) {
        console.error(
          "Failed to create interview invite:",
          interviewError.reason
        );
      } else {
        interviewLink = `${process.env.SITE_URL ?? "https://photobookers.com"}/interviews/${inviteToken}`;
      }
    }
    if (!user.user_metadata?.claimIntent) {
      const welcomeName = isCreator ? user.user_metadata?.displayName ?? null : user.user_metadata?.firstName ?? null;
      await createUserVerifiedNotification(welcomeName, dbUser);
      const [emailError] = await sendEmail(
        user.email,
        "You're verified \u2013 welcome to Photobookers",
        generateVerificationWelcomeEmail(welcomeName, interviewLink)
      );
      if (emailError)
        console.error("Verification welcome email failed:", emailError.reason);
    }
    if (user.user_metadata?.claimIntent) {
      const pendingCreatorId = getPendingCreatorId(user.user_metadata);
      const pendingVerificationUrl = getPendingVerificationUrl(
        user.user_metadata
      );
      let afterResetUrl = "/";
      if (pendingCreatorId && pendingVerificationUrl) {
        afterResetUrl = `/claims/complete?creatorId=${pendingCreatorId}&verificationUrl=${encodeURIComponent(pendingVerificationUrl)}`;
      } else if (pendingCreatorId) {
        afterResetUrl = `/claims/${pendingCreatorId}`;
      } else {
        console.error(
          "claimIntent set but missing creatorId in user_metadata",
          { userId: user.id }
        );
      }
      return c.redirect(
        `/auth/force-reset-password?redirectUrl=${encodeURIComponent(afterResetUrl)}`
      );
    }
    await setFlash(c, "success", "Account Verified. Welcome to Photobookers!");
    return c.redirect("/");
  }
);
export {
  GET
};
