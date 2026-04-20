import { createRoute } from "hono-fsr";
import { queryValidator } from "../../lib/validator";
import { processRegisterQuerySchema } from "../../features/auth/schema";
import { ProcessRegisterQueryContext } from "../../features/auth/types";
import {
  getCallbackErrorMessage,
  getPendingCreatorId,
  getPendingVerificationUrl,
  verifyOtpForSignup,
} from "../../features/auth/utils";
import {
  createUserInDatabase,
  setCookiesAndVerifyUser,
} from "../../features/auth/services";
import { createStubCreatorProfile } from "../../features/dashboard/creators/services";
import { createUserVerifiedNotification } from "../../features/dashboard/admin/notifications/utils";
import { sendEmail } from "../../lib/sendEmail";
import { generateVerificationWelcomeEmail } from "../../features/auth/emails";
import { setFlash } from "../../utils";
import InfoPage from "../../pages/InfoPage";
import { nanoid } from "nanoid";
import { createCreatorInterviewInviteAdmin } from "../../features/dashboard/admin/creators/services";

export const GET = createRoute(
  queryValidator(processRegisterQuerySchema),
  async (c: ProcessRegisterQueryContext) => {
    const tokenHash = c.req.valid("query").token_hash;
    const error = c.req.valid("query").error;
    const errorCode = c.req.valid("query").error_code;
    const errorDescription = c.req.valid("query").error_description;

    if (error || errorCode) {
      const message = getCallbackErrorMessage(
        error,
        errorCode,
        errorDescription,
      );
      return c.html(<InfoPage errorMessage={message} />);
    }

    if (!tokenHash)
      return c.html(<InfoPage errorMessage={getCallbackErrorMessage()} />);

    const [signupError, session] = await verifyOtpForSignup(c, tokenHash);
    if (signupError) {
      return c.html(<InfoPage errorMessage={signupError.reason} />);
    }

    const { user } = session;
    const type = user.user_metadata?.type as string | undefined;
    const isCreator = type === "artist" || type === "publisher";
    await setCookiesAndVerifyUser(c, session);

    if (!user.email)
      return c.html(
        <InfoPage errorMessage="Failed to create account. Please try again." />,
      );

    const [dbError, dbUser] = await createUserInDatabase(session);
    if (dbError) return c.html(<InfoPage errorMessage={dbError.reason} />);

    let interviewLink: string | null = null;

    if (isCreator) {
      const [newCreatorError, newCreator] =
        await createStubCreatorProfile(session);
      if (newCreatorError)
        return c.html(<InfoPage errorMessage={newCreatorError.reason} />);

      const inviteToken = nanoid(32);
      const [interviewError] = await createCreatorInterviewInviteAdmin({
        creatorId: newCreator.id,
        recipientEmail: user.email,
        invitedByUserId: user.id,
        inviteToken,
        interviewType: "introduction",
      });

      if (interviewError) {
        console.error(
          "Failed to create interview invite:",
          interviewError.reason,
        );
      } else {
        interviewLink = `${process.env.SITE_URL ?? "https://photobookers.com"}/interviews/${inviteToken}`;
      }
    }

    const welcomeName = isCreator
      ? (user.user_metadata?.displayName ?? null)
      : (user.user_metadata?.firstName ?? null);

    await createUserVerifiedNotification(welcomeName, dbUser);

    const [emailError] = await sendEmail(
      user.email,
      "You're verified – welcome to Photobookers",
      generateVerificationWelcomeEmail(welcomeName, interviewLink),
    );

    if (emailError)
      console.error("Verification welcome email failed:", emailError.reason);

    if (user.user_metadata?.claimIntent) {
      const pendingCreatorId = getPendingCreatorId(user.user_metadata);
      const pendingVerificationUrl = getPendingVerificationUrl(
        user.user_metadata,
      );
      if (pendingCreatorId && pendingVerificationUrl) {
        const target = `/claims/complete?creatorId=${pendingCreatorId}&verificationUrl=${encodeURIComponent(pendingVerificationUrl)}`;
        return c.redirect(target);
      }
    }

    await setFlash(c, "success", "Account Verified. Welcome to Photobookers!");
    return c.redirect("/");
  },
);
