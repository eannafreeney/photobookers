import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import {
  getCreatorByIdAdmin,
  markWelcomeEmailSentAdmin,
} from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getUser } from "../../../../../utils";
import { generateWelcomeEmail } from "../../../../../features/dashboard/admin/creators/emails";
import { sendEmail } from "../../../../../lib/sendEmail";
import Alert from "../../../../../components/app/Alert";
import SendWelcomeEmailButton from "../../../../../features/dashboard/admin/creators/components/SendWelcomeEmailButton";

export const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");
  if (!creator.email) return showErrorAlert(c, "Creator has no email");

  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "User not found");

  const temporaryPassword = crypto.randomUUID();

  const loginLink = `${process.env.SITE_URL}/auth/login?email=${encodeURIComponent(creator.email)}&password=${encodeURIComponent(temporaryPassword)}`;

  const emailHTML = generateWelcomeEmail(creator, loginLink);

  const [emailError] = await sendEmail(
    creator.email,
    `Hi ${creator.displayName}! Invitation to Photobookers`,
    emailHTML,
  );
  if (emailError) return showErrorAlert(c, "Failed to send welcome email");

  const [markError, updatedCreator] =
    await markWelcomeEmailSentAdmin(creatorId);
  if (markError) return showErrorAlert(c, "Failed to mark welcome email sent");

  return c.html(
    <>
      <Alert
        type="success"
        message={`Welcome email sent to ${creator.displayName} at ${creator.email}`}
      />
      <SendWelcomeEmailButton creator={updatedCreator} />
    </>,
  );
});
