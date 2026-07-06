import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import {
  createCreatorInterviewInviteAdmin,
  getCreatorRecipientEmailAdmin,
  markInterviewEmailSentAdmin
} from "../../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { getUser } from "../../../../../utils.js";
import { nanoid } from "nanoid";
import { generateInterviewInviteEmail } from "../../../../../features/dashboard/admin/creators/emails.js";
import { sendEmail } from "../../../../../lib/sendEmail.js";
import Alert from "../../../../../components/app/Alert.js";
import SendInterviewButton from "../../../../../features/dashboard/admin/creators/components/SendInterviewButton.js";
const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
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
    creatorSlug: creator.slug,
    recipientEmail,
    invitedByUserId: user.id,
    inviteToken,
    interviewType: "introduction",
    bookId: null
  });
  if (createError) return showErrorAlert(c, createError.reason);
  const interviewLink = `${process.env.SITE_URL}/interviews/${inviteToken}`;
  const html = generateInterviewInviteEmail({
    creatorName: creator.displayName,
    interviewLink,
    profileUrl: `https://photobookers.com/creators/${creator.slug}`
  });
  const [emailError] = await sendEmail(
    recipientEmail,
    `Interview invitation for ${creator.displayName}`,
    html
  );
  if (emailError) return showErrorAlert(c, emailError.reason);
  const [creatorErr, updatedCreator] = await markInterviewEmailSentAdmin(creatorId);
  if (creatorErr || !updatedCreator)
    return showErrorAlert(c, "Failed to update creator");
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Interview invite sent to ${recipientEmail}!`
        }
      ),
      /* @__PURE__ */ jsx(SendInterviewButton, { creator: updatedCreator })
    ] })
  );
});
export {
  POST
};
