import { Context } from "hono";
import {
  completeInterviewByToken,
  getInterviewByToken,
} from "../../features/dashboard/admin/creators/services";
import { getCreatorById } from "../../features/dashboard/creators/services";
import IntervewForm from "../../features/interviews/forms/IntervewForm";
import InfoPage from "../../pages/InfoPage";
import { createRoute } from "hono-fsr";
import { showErrorAlert } from "../../lib/alertHelpers";
import { interviewFormSchema } from "../../features/interviews/schema";
import { formValidator } from "../../lib/validator";
import { InterviewFormContext } from "../../features/interviews/types";
import FormSuccessScreen from "../../components/forms/FormSuccessScreen";

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
    const inviteToken = c.req.param("inviteToken");
    const form = c.req.valid("form");

    if (!inviteToken) return showErrorAlert(c, "Invalid interview link");

    const [error] = await completeInterviewByToken(inviteToken, form);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <FormSuccessScreen
        id="interview-form"
        message="Thank you. Interview submitted."
      />,
    );
  },
);
