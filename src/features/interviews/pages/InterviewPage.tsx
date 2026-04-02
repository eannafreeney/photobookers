import InfoPage from "../../../pages/InfoPage";
import { getInterviewByToken } from "../../dashboard/admin/creators/services";
import { getCreatorById } from "../../dashboard/creators/services";
import IntervewForm from "../forms/IntervewForm";

const InterviewPage = async ({ inviteToken }: { inviteToken: string }) => {
  const [err, interview] = await getInterviewByToken(inviteToken);

  if (err || !interview)
    return <InfoPage errorMessage="Invalid interview link" />;

  if (interview.status === "completed") {
    return <InfoPage isSuccess errorMessage="Interview already completed." />;
  }
  if (interview.status === "expired") {
    return <InfoPage errorMessage="This interview link has expired." />;
  }

  if (interview.status !== "sent") {
    return <InfoPage errorMessage="Invalid interview link" />;
  }

  const [creatorErr, creator] = await getCreatorById(interview?.creatorId);
  if (creatorErr || !creator)
    return <InfoPage errorMessage="Creator not found" />;

  return <IntervewForm inviteToken={inviteToken} creator={creator} />;
};

export default InterviewPage;
