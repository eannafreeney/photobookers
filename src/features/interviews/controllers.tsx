import FormSuccessScreen from "../../components/forms/FormSuccessScreen";
import { showErrorAlert } from "../../lib/alertHelpers";
import InfoPage from "../../pages/InfoPage";
import {
  completeInterviewByToken,
  getInterviewByToken,
} from "../dashboard/admin/creators/services";
import InterviewPage from "./pages/InterviewPage";

export const getInterviewPage = async (c: any) => {
  const inviteToken = c.req.param("inviteToken");

  return c.html(<InterviewPage inviteToken={inviteToken} />);
};

export const submitInterview = async (c: any) => {
  const inviteToken = c.req.param("inviteToken");
  const form = c.req.valid("form");

  const [error] = await completeInterviewByToken(inviteToken, form);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <FormSuccessScreen
      id="interview-form"
      message="Thank you. Interview submitted."
    />,
  );
};
