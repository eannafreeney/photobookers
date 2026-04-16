import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import {
  createCreatorInterviewInviteAdmin,
  getCreatorRecipientEmailAdmin,
  markInterviewEmailSentAdmin,
} from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getUser } from "../../../../../utils";
import { nanoid } from "nanoid";
import { generateInterviewInviteEmail } from "../../../../../features/dashboard/admin/creators/emails";
import { sendEmail } from "../../../../../lib/sendEmail";
import Alert from "../../../../../components/app/Alert";
import SendInterviewButton from "../../../../../features/dashboard/admin/creators/components/SendInterviewButton";

export const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [err, resolved] = await getCreatorRecipientEmailAdmin(creatorId);
  if (err) return showErrorAlert(c, "Creator not found");
  const { creator, recipientEmail } = resolved;

  if (!recipientEmail) return showErrorAlert(c, "No recipient email found");

  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "User not found");

  const inviteToken = nanoid(32);
  const [createError] = await createCreatorInterviewInviteAdmin({
    creatorId,
    recipientEmail,
    invitedByUserId: user.id,
    inviteToken,
    interviewType: "introduction",
    bookId: null,
  });
  if (createError) return showErrorAlert(c, createError.reason);

  const interviewLink = `${process.env.SITE_URL}/interviews/${inviteToken}`;
  const html = generateInterviewInviteEmail({
    creatorName: creator.displayName,
    interviewLink,
    profileUrl: `https://photobookers.com/creators/${creator.slug}`,
  });

  const [emailError] = await sendEmail(
    recipientEmail,
    `Interview invitation for ${creator.displayName}`,
    html,
  );
  if (emailError) return showErrorAlert(c, emailError.reason);

  const [creatorErr, updatedCreator] =
    await markInterviewEmailSentAdmin(creatorId);
  if (creatorErr || !updatedCreator)
    return showErrorAlert(c, "Failed to update creator");

  return c.html(
    <>
      <Alert
        type="success"
        message={`Interview invite sent to ${recipientEmail}!`}
      />
      <SendInterviewButton creator={updatedCreator} />
    </>,
  );
});
