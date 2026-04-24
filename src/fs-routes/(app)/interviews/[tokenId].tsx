import { Context } from "hono";
import {
  completeInterviewByToken,
  getInterviewByToken,
} from "../../../features/dashboard/admin/creators/services";
import { getCreatorById } from "../../../features/dashboard/creators/services";
import IntervewForm from "../../../features/interviews/forms/IntervewForm";
import InfoPage from "../../../pages/InfoPage";
import { createRoute } from "hono-fsr";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { interviewFormSchema } from "../../../features/interviews/schema";
import { formValidator, validateImageFile } from "../../../lib/validator";
import { InterviewFormContext } from "../../../features/interviews/types";
import FormSuccessScreen from "../../../components/forms/FormSuccessScreen";
import { createInterviewSubmittedNotification } from "../../../features/dashboard/admin/notifications/utils";
import { uploadImage } from "../../../services/storage";

export const GET = createRoute(async (c: Context) => {
  const tokenId = c.req.param("tokenId");
  const [err, interview] = await getInterviewByToken(tokenId);

  if (err || !interview)
    return c.html(<InfoPage errorMessage="Invalid interview link" />);

  if (interview.status === "completed") {
    return c.html(
      <InfoPage isSuccess errorMessage="Interview already completed." />,
    );
  }
  if (interview.status === "expired") {
    return c.html(<InfoPage errorMessage="This interview link has expired." />);
  }

  if (interview.status !== "sent") {
    return c.html(<InfoPage errorMessage="Invalid interview link" />);
  }

  const [creatorErr, creator] = await getCreatorById(interview?.creatorId);
  if (creatorErr || !creator)
    return c.html(<InfoPage errorMessage="Creator not found" />);

  return c.html(<IntervewForm inviteToken={tokenId} creator={creator} />);
});

export const POST = createRoute(
  formValidator(interviewFormSchema),
  async (c: InterviewFormContext) => {
    const inviteToken = c.req.param("tokenId");
    const form = c.req.valid("form");

    if (!inviteToken) return showErrorAlert(c, "Invalid interview link");

    let promoImageUrl: string | null = null;
    const body = await c.req.parseBody();
    const file = body["promoImage"];
    if (file) {
      const validated = validateImageFile(file);
      if (!validated.success) return showErrorAlert(c, validated.error);
      try {
        const result = await uploadImage(
          validated.file,
          "interviews/promo",
          "cover",
        );
        promoImageUrl = result.url;
      } catch {
        return showErrorAlert(c, "Failed to upload image");
      }
    }

    if (!promoImageUrl) return showErrorAlert(c, "Promo image is required");

    const [error, row] = await completeInterviewByToken(
      inviteToken,
      form,
      promoImageUrl,
    );
    if (error) return showErrorAlert(c, error.reason);

    const [creatorErr, creator] = await getCreatorById(row.creatorId);
    if (creatorErr || !creator) return showErrorAlert(c, "Creator not found");

    await createInterviewSubmittedNotification(creator);

    return c.html(
      <FormSuccessScreen
        id="interview-form"
        message="Thank you. Interview submitted."
      />,
    );
  },
);
